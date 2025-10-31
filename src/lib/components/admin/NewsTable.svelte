<script lang="ts">
	import {
		Badge,
		Button,
		Card,
		SuperTable,
		TableHandler,
		Row,
		Cell,
		type SuperTableHead
	} from '@pixelcode_/blocks/components';
	import type { PageData } from '../../../routes/internal/news/$types';

	export type ArticleRow = PageData['articles'][number];

	export let articles: ArticleRow[] = [];
	export let onEdit: (article: ArticleRow) => void;
	export let onDelete: (article: ArticleRow) => void;

	type TableRow = ArticleRow & {
		source: ArticleRow;
		kindLabel: string;
		statusVariant: 'success' | 'warning';
		internalUrl: string | null;
		externalUrl: string | null;
	};

	const headings: SuperTableHead<TableRow>[] = [
		{ heading: 'Title', sortable: 'title', width: 34 },
		{ heading: 'Kind', sortable: 'kindLabel', width: 18 },
		{ heading: 'Status', sortable: 'status', width: 16 },
		{ heading: 'Preview', width: 16 },
		{ heading: 'Actions', width: 16 }
	];

	const toRows = (items: ArticleRow[]): TableRow[] =>
		items.map((article) => {
			const internalUrl = article.slug ? `/news/${article.slug}` : null;
			const externalUrl = article.linkedin_url ? article.linkedin_url : null;

			return {
				...article,
				source: article,
				kindLabel: article.kind_name ?? 'Unknown',
				statusVariant: article.status === 'published' ? 'success' : 'warning',
				internalUrl,
				externalUrl
			};
		});

	let tableRows: TableRow[] = toRows(articles);
	let tableInstance = new TableHandler<TableRow>(
		headings,
		tableRows.map((row) => ({ ...row }))
	);

	$: tableRows = toRows(articles);
	$: tableInstance = new TableHandler<TableRow>(
		headings,
		tableRows.map((row) => ({ ...row }))
	);
</script>

<Card class="space-y-4 border-border/20 bg-white p-4">
	<SuperTable instance={tableInstance} selectable={false} class="news-table w-full">
		{#each tableInstance.data as row (row.id)}
			<Row.Root>
				<Cell.Value class="align-top">
					<div class="space-y-2">
						<p class="text-sm font-semibold text-gray-900">{row.title}</p>
						{#if row.slug}
							<p class="text-xs font-medium text-gray-700">Slug: /{row.slug}</p>
						{/if}
					</div>
				</Cell.Value>

				<Cell.Value class="align-top">
					<p class="text-sm font-medium text-gray-900">{row.kindLabel}</p>
				</Cell.Value>

				<Cell.Value class="align-top">
					<Badge variant={row.statusVariant} size="xs" class="tracking-wide uppercase">
						{row.status}
					</Badge>
				</Cell.Value>

				<Cell.Value class="align-top">
					<div class="flex flex-wrap gap-2">
						{#if row.internalUrl}
							<Button
								variant="link"
								size="sm"
								href={row.internalUrl}
								target="_blank"
								rel="noreferrer"
							>
								Preview
							</Button>
						{/if}
						{#if row.externalUrl}
							<Button
								variant="link"
								size="sm"
								href={row.externalUrl}
								target="_blank"
								rel="noreferrer"
							>
								LinkedIn
							</Button>
						{/if}
						{#if !row.internalUrl && !row.externalUrl}
							<span class="text-sm font-medium text-gray-700">Not set</span>
						{/if}
					</div>
				</Cell.Value>

				<Cell.Value class="flex justify-end gap-2">
					<Button variant="outline" size="sm" type="button" onclick={() => onEdit(row.source)}>
						Edit
					</Button>
					<Button
						variant="destructive"
						size="sm"
						type="button"
						onclick={() => onDelete(row.source)}
					>
						Delete
					</Button>
				</Cell.Value>
			</Row.Root>
		{/each}
	</SuperTable>

	{#if articles.length === 0}
		<p class="text-sm font-medium text-gray-700">
			No articles yet. Use Create post to publish your first update.
		</p>
	{/if}
</Card>

<style>
        .news-table .flex.justify-center.p-2.text-sm.font-semibold {
                display: none;
        }
</style>
