import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getResumeEditPermissions } from '../../src/lib/server/resumes/permissions';
import { importResumeFromPdf, ResumePdfImportError } from '../../src/lib/server/resumes/pdfImport';

const AUTH_COOKIE_ACCESS = 'sb-access-token';
const MAX_PDF_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(['application/pdf']);

type NetlifyEvent = {
	body: string | null;
	headers: Record<string, string | undefined>;
	httpMethod: string;
	isBase64Encoded?: boolean;
	path?: string;
	rawUrl?: string;
};

type NetlifyResponse = {
	statusCode: number;
	headers?: Record<string, string>;
	body: string;
};

type ResumeImportJobStatus = 'queued' | 'processing' | 'succeeded' | 'failed';

type ResumeImportJobRow = {
	id: string;
	person_id: string;
	requested_by_user_id: string;
	status: ResumeImportJobStatus;
	source_filename: string;
	source_size_bytes: number;
};

const jsonResponse = (statusCode: number, body: Record<string, unknown>): NetlifyResponse => ({
	statusCode,
	headers: {
		'content-type': 'application/json; charset=utf-8'
	},
	body: JSON.stringify(body)
});

const toSafeMessage = (value: unknown, fallback: string): string => {
	if (typeof value !== 'string') return fallback;
	const trimmed = value.trim();
	return trimmed ? trimmed.slice(0, 300) : fallback;
};

const hasPdfExtension = (filename: string): boolean => filename.toLowerCase().endsWith('.pdf');

const getCookieValue = (cookieHeader: string | undefined, key: string): string | null => {
	if (!cookieHeader) return null;
	const parts = cookieHeader.split(';');
	for (const part of parts) {
		const [rawName, ...rest] = part.trim().split('=');
		if (rawName !== key) continue;
		return decodeURIComponent(rest.join('=') || '');
	}
	return null;
};

const getRequiredEnv = (name: string): string => {
	const value = process.env[name]?.trim();
	if (!value) {
		throw new Error(`${name} is required.`);
	}
	return value;
};

const createSupabaseClients = (
	accessToken: string
): { supabase: SupabaseClient; adminClient: SupabaseClient } => {
	const supabaseUrl = getRequiredEnv('SUPABASE_URL');
	const supabaseAnonKey = getRequiredEnv('SUPABASE_ANON_KEY');
	const serviceRoleKey = getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY');

	const supabase = createClient(supabaseUrl, supabaseAnonKey, {
		global: {
			headers: {
				Authorization: `Bearer ${accessToken}`
			}
		},
		auth: {
			persistSession: false,
			autoRefreshToken: false
		}
	});

	const adminClient = createClient(supabaseUrl, serviceRoleKey, {
		auth: {
			persistSession: false,
			autoRefreshToken: false
		}
	});

	return { supabase, adminClient };
};

const toRequest = (event: NetlifyEvent): Request => {
	const headers = new Headers();
	for (const [key, value] of Object.entries(event.headers ?? {})) {
		if (typeof value === 'string') {
			headers.set(key, value);
		}
	}

	const body =
		typeof event.body === 'string'
			? Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8')
			: undefined;

	const url =
		event.rawUrl ||
		`https://${event.headers.host || 'localhost'}${event.path || '/.netlify/functions/resume-import-from-pdf-background'}`;

	return new Request(url, {
		method: event.httpMethod || 'POST',
		headers,
		body
	});
};

const logPhase = (
	phase: string,
	meta: Record<string, unknown> = {},
	level: 'info' | 'warn' | 'error' = 'info'
) => {
	const payload = { phase, ...meta };
	if (level === 'error') {
		console.error('[resume-import-bg]', payload);
		return;
	}
	if (level === 'warn') {
		console.warn('[resume-import-bg]', payload);
		return;
	}
	console.info('[resume-import-bg]', payload);
};

const updateJob = async (
	adminClient: SupabaseClient,
	jobId: string,
	patch: Record<string, unknown>
) => {
	const now = new Date().toISOString();
	const { error } = await adminClient
		.from('resume_import_jobs')
		.update({ ...patch, updated_at: now })
		.eq('id', jobId);

	if (error) {
		throw new Error(error.message);
	}
};

const failJob = async (
	adminClient: SupabaseClient,
	jobId: string,
	message: string,
	extra: Record<string, unknown> = {}
) => {
	await updateJob(adminClient, jobId, {
		status: 'failed',
		error_message: toSafeMessage(message, 'Could not import resume from PDF right now.'),
		completed_at: new Date().toISOString(),
		...extra
	});
};

const isUploadFile = (
	value: FormDataEntryValue | null
): value is File & { arrayBuffer: () => Promise<ArrayBuffer> } =>
	!!value &&
	typeof value === 'object' &&
	typeof (value as { arrayBuffer?: unknown }).arrayBuffer === 'function';

export const handler = async (event: NetlifyEvent): Promise<NetlifyResponse> => {
	const requestId = event.headers['x-nf-request-id'] ?? null;
	const startedAtMs = Date.now();

	let jobId = '';
	let personId = '';
	let filename = '';
	let sizeBytes = 0;
	let adminClient: SupabaseClient | null = null;

	try {
		const formData = await toRequest(event).formData();
		const jobIdValue = formData.get('job_id');
		const personIdValue = formData.get('person_id');
		const fileValue = formData.get('file');

		jobId = typeof jobIdValue === 'string' ? jobIdValue.trim() : '';
		personId = typeof personIdValue === 'string' ? personIdValue.trim() : '';

		if (!jobId) {
			return jsonResponse(400, { message: 'Missing job_id.' });
		}

		if (!personId) {
			return jsonResponse(400, { message: 'Missing person_id.' });
		}

		if (!isUploadFile(fileValue)) {
			return jsonResponse(400, { message: 'PDF file is required.' });
		}

		filename = fileValue.name || 'resume.pdf';
		const mimeType = (fileValue.type || '').toLowerCase();
		if (!ALLOWED_MIME_TYPES.has(mimeType) && !hasPdfExtension(filename)) {
			return jsonResponse(400, { message: 'Only PDF files are allowed.' });
		}

		const fileBytes = new Uint8Array(await fileValue.arrayBuffer());
		sizeBytes = fileBytes.byteLength;

		if (sizeBytes === 0) {
			return jsonResponse(400, { message: 'PDF file is empty.' });
		}

		if (sizeBytes > MAX_PDF_BYTES) {
			return jsonResponse(400, { message: 'PDF file is too large. Max size is 10MB.' });
		}

		const accessToken = getCookieValue(event.headers.cookie, AUTH_COOKIE_ACCESS);
		if (!accessToken) {
			return jsonResponse(401, { message: 'Unauthorized.' });
		}

		const clients = createSupabaseClients(accessToken);
		adminClient = clients.adminClient;

		const { data: jobRow, error: jobError } = await adminClient
			.from('resume_import_jobs')
			.select('id, person_id, requested_by_user_id, status, source_filename, source_size_bytes')
			.eq('id', jobId)
			.maybeSingle();

		if (jobError) {
			return jsonResponse(500, { message: jobError.message });
		}

		if (!jobRow?.id) {
			return jsonResponse(404, { message: 'Import job not found.' });
		}

		const job = jobRow as ResumeImportJobRow;

		if (job.person_id !== personId) {
			await failJob(adminClient, jobId, 'Import job does not match target profile.', {
				request_id: requestId
			});
			return jsonResponse(400, { message: 'Import job does not match target profile.' });
		}

		if (job.status === 'succeeded') {
			logPhase('job:duplicate-succeeded', {
				job_id: jobId,
				person_id: personId,
				request_id: requestId
			});
			return jsonResponse(202, { ok: true, status: 'succeeded' });
		}

		if (job.status === 'processing') {
			logPhase('job:duplicate-processing', {
				job_id: jobId,
				person_id: personId,
				request_id: requestId
			});
			return jsonResponse(202, { ok: true, status: 'processing' });
		}

		if (job.status !== 'queued') {
			return jsonResponse(409, { message: 'Import job cannot be started again.' });
		}

		if (job.source_size_bytes !== sizeBytes) {
			await failJob(adminClient, jobId, 'Uploaded file does not match queued import metadata.', {
				request_id: requestId
			});
			return jsonResponse(400, { message: 'Uploaded file metadata does not match import job.' });
		}

		const permissions = await getResumeEditPermissions(clients.supabase, adminClient, personId);
		if (!permissions.canEdit || !permissions.userId) {
			await failJob(adminClient, jobId, 'Not authorized to create resumes for this user.', {
				request_id: requestId
			});
			return jsonResponse(403, { message: 'Not authorized to create resumes for this user.' });
		}

		if (permissions.userId !== job.requested_by_user_id) {
			await failJob(adminClient, jobId, 'Import job requester mismatch.', {
				request_id: requestId
			});
			return jsonResponse(403, { message: 'Import job requester mismatch.' });
		}

		const { data: profile, error: profileError } = await adminClient
			.from('profiles')
			.select('id, first_name, last_name')
			.eq('id', personId)
			.maybeSingle();

		if (profileError || !profile?.id) {
			await failJob(adminClient, jobId, 'Profile not found.', { request_id: requestId });
			return jsonResponse(404, { message: 'Profile not found.' });
		}

		const personName =
			[profile.first_name, profile.last_name].filter(Boolean).join(' ').trim() || 'Consultant';
		const model =
			process.env.LLM_MODEL_PDF_IMPORT?.trim() || process.env.LLM_MODEL?.trim() || 'gpt-4o-mini';

		await updateJob(adminClient, jobId, {
			status: 'processing',
			error_message: null,
			request_id: requestId,
			model,
			started_at: new Date().toISOString(),
			completed_at: null
		});

		logPhase('job:started', {
			job_id: jobId,
			person_id: personId,
			filename,
			size_bytes: sizeBytes,
			model,
			request_id: requestId
		});

		logPhase('openai:import:start', { job_id: jobId, person_id: personId, request_id: requestId });
		const imported = await importResumeFromPdf({
			pdfBytes: fileBytes,
			filename,
			personName
		});
		logPhase('openai:import:done', {
			job_id: jobId,
			person_id: personId,
			request_id: requestId,
			usage: imported.usage ?? null
		});

		const versionName = imported.versionNameEn || 'Imported Resume';
		const { data: createdResume, error: createResumeError } = await adminClient
			.from('resumes')
			.insert({
				user_id: personId,
				version_name: versionName,
				is_main: false,
				is_active: true,
				allow_word_export: false,
				content: imported.content,
				preview_html: null
			})
			.select('id, version_name')
			.single();

		if (createResumeError || !createdResume?.id) {
			throw new Error(createResumeError?.message ?? 'Failed to create imported resume.');
		}

		logPhase('resume:inserted', {
			job_id: jobId,
			person_id: personId,
			resume_id: createdResume.id,
			request_id: requestId
		});

		await updateJob(adminClient, jobId, {
			status: 'succeeded',
			error_message: null,
			resume_id: createdResume.id,
			resume_version_name: createdResume.version_name ?? versionName,
			usage: imported.usage ?? null,
			completed_at: new Date().toISOString()
		});

		logPhase('job:succeeded', {
			job_id: jobId,
			person_id: personId,
			resume_id: createdResume.id,
			duration_ms: Date.now() - startedAtMs,
			request_id: requestId
		});

		return jsonResponse(202, { ok: true, status: 'processing' });
	} catch (error) {
		const isMappedImportError = error instanceof ResumePdfImportError;
		const status =
			isMappedImportError && typeof error.status === 'number'
				? error.status
				: typeof error === 'object' &&
					  error !== null &&
					  typeof (error as { status?: unknown }).status === 'number'
					? ((error as { status: number }).status ?? 500)
					: 500;
		const message = toSafeMessage(
			error instanceof Error ? error.message : undefined,
			'Could not import resume from PDF right now.'
		);

		if (adminClient && jobId) {
			try {
				await failJob(adminClient, jobId, message, {
					request_id: requestId,
					completed_at: new Date().toISOString()
				});
			} catch (jobUpdateError) {
				logPhase(
					'job:failed-update-error',
					{
						job_id: jobId,
						request_id: requestId,
						message: toSafeMessage(
							jobUpdateError instanceof Error ? jobUpdateError.message : undefined,
							'Failed to update job state.'
						)
					},
					'error'
				);
			}
		}

		logPhase(
			'job:failed',
			{
				job_id: jobId || null,
				person_id: personId || null,
				filename: filename || null,
				size_bytes: sizeBytes || null,
				status,
				message,
				duration_ms: Date.now() - startedAtMs,
				request_id: requestId
			},
			'error'
		);

		return jsonResponse(status >= 400 && status <= 599 ? status : 500, { message });
	}
};
