<script lang="ts">
	import {
		Accordion,
		Alert,
		Badge,
		Button,
		Card,
		Checkbox,
		ComboBox,
		ComboBoxHandler,
		Datepicker,
		Divider,
		Drawer,
		Dropdown,
		FileZone,
		FormControl,
		Icon,
		Input,
		Link,
		Lookup,
		LookupHandler,
		Mode,
		Radio,
		Select,
		Skeleton,
		SuperTable,
		Tab,
		TabHandler,
		TableHandler,
		TextArea,
		Toaster,
		Cell,
		Row,
		toast
	} from '@pixelcode_/blocks/components';
	import {
		Info,
		CheckCircle,
		AlertTriangle,
		AlertCircle,
		Home,
		Settings,
		User,
		Mail,
		Heart,
		Star,
		ChevronDown,
		ChevronRight,
		Download,
		LogOut,
		Menu,
		Trash,
		Upload,
		Edit
	} from 'lucide-svelte';
	import type { LookupItem } from '@pixelcode_/blocks/components';

	let checkboxValue = $state(false);
	let radioValue = $state('option1');
	let inputValue = $state('');
	let textareaValue = $state('');
	let selectValue = $state('option1');
	let selectedDate = $state('');
	let drawerRightOpen = $state(false);
	let drawerLeftOpen = $state(false);
	let drawerTopOpen = $state(false);
	let drawerBottomOpen = $state(false);
	let drawerModalOpen = $state(false);
	let uploadedFiles = $state<FileList | undefined>(undefined);
	let isSubmittingFile = $state(false);

	const tabInstance = new TabHandler(['tab1', 'tab2', 'tab3']);

	type Teammate = {
		id: number;
		name: string;
		department: string;
		location: string;
	};

	const createTeammates = (): Teammate[] => [
		{ id: 1, name: 'Alex Johnson', department: 'Design', location: 'Visby' },
		{ id: 2, name: 'Jamie Lee', department: 'Engineering', location: 'Stockholm' },
		{ id: 3, name: 'Skyler Chen', department: 'Product', location: 'Göteborg' },
		{ id: 4, name: 'Taylor Brooks', department: 'Engineering', location: 'Malmö' },
		{ id: 5, name: 'Robin Singh', department: 'Support', location: 'Visby' }
	];

	const singleComboInstance = new ComboBoxHandler<Teammate>(createTeammates(), [
		'{name}',
		' — ',
		'{department}'
	]);

	const multiComboInstance = new ComboBoxHandler<Teammate>(
		createTeammates(),
		['{name}'],
		{ multiple: true },
		(item) => item.department
	);

	type LookupProfile = {
		name: string;
		role: string;
	};

	const lookupInstance = new LookupHandler<LookupProfile>(
		[
			{ name: 'Amelia Rossi', role: 'Product Designer' },
			{ name: 'Henrik Larsson', role: 'Backend Engineer' },
			{ name: 'Linn Östberg', role: 'Frontend Engineer' },
			{ name: 'Sofia Almeida', role: 'Project Manager' },
			{ name: 'Yoel Ruiz', role: 'QA Analyst' }
		],
		['{name}', ' — ', '{role}']
	);
	let selectedLookup = $state<LookupItem<LookupProfile> | null>(null);

	type InvoiceRow = {
		id: number;
		customer: string;
		status: 'Pending' | 'Paid' | 'Overdue';
		total: number;
		date: string;
		owner: string;
	};

	const invoiceHeadings = [
		{ heading: 'Invoice', sortable: 'id', filterable: 'id', width: 10 },
		{ heading: 'Customer', sortable: 'customer', filterable: 'customer', width: 26 },
		{ heading: 'Status', sortable: 'status', filterable: 'status', width: 16 },
		{ heading: 'Total', sortable: 'total', width: 16 },
		{ heading: 'Due', sortable: 'date', width: 16 },
		{ heading: '', width: 16 }
	];

	const invoiceTable = new TableHandler<InvoiceRow>(invoiceHeadings, [
		{
			id: 2041,
			customer: 'Nordic Solar',
			status: 'Pending',
			total: 48200,
			date: '2024-12-20',
			owner: 'Amelia'
		},
		{
			id: 2042,
			customer: 'Gotland Ferries',
			status: 'Paid',
			total: 12650,
			date: '2024-12-12',
			owner: 'Henrik'
		},
		{
			id: 2043,
			customer: 'Baltic Foods',
			status: 'Overdue',
			total: 18990,
			date: '2024-11-05',
			owner: 'Linn'
		},
		{
			id: 2044,
			customer: 'Visby Ventures',
			status: 'Pending',
			total: 9450,
			date: '2024-12-02',
			owner: 'Sofia'
		}
	]);

	const formatCurrency = (value: number) =>
		new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(value);

	function simulateUploadCheck() {
		if (!uploadedFiles?.length) {
			toast('Lägg till en fil först.');
			return;
		}

		isSubmittingFile = true;
		setTimeout(() => {
			isSubmittingFile = false;
			toast.success?.('Filen är validerad!') ?? toast('Filen är validerad!');
		}, 800);
	}

	function handleLookupSelect(profile: LookupItem<LookupProfile>) {
		selectedLookup = profile;
		toast('Valde ' + profile.name);
	}
</script>

<Mode.Watcher defaultMode="dark" track={false} />
<Toaster richColors closeButton position="top-center" />

<div
	class="bg-topography
 -mt-50 min-h-screen"
>
	<div class="container mx-auto px-4 py-12 pt-50">
		<div class="mb-12 text-center">
			<h1 class="mb-4 text-4xl font-bold text-white">Component Library</h1>
			<p class="text-lg text-white/80">
				Showcase of all available components from @pixelcode_/blocks
			</p>
		</div>

		<div class="space-y-16">
			<!-- Buttons Section -->
			<section class="space-y-6">
				<div class="border-b pb-4">
					<h2 class="text-3xl font-bold text-white">Buttons</h2>
					<p class="text-white/80">Various button styles and variants</p>
				</div>
				<Card class="p-6">
					<div class="flex flex-wrap gap-4">
						<Button variant="primary">Primary</Button>
						<Button variant="outline">Outline</Button>
						<Button variant="ghost">Ghost</Button>
						<Button variant="destructive">Destructive</Button>
						<Button variant="destructive-outline">Destructive Outline</Button>
						<Button variant="text-link">Text Link</Button>
						<Button variant="inverted" class="text-white">Inverted</Button>
						<Button variant="inverted-outline">Inverted Outline</Button>
					</div>
				</Card>
			</section>

			<!-- Icons Section -->
			<section class="space-y-6">
				<div class="border-b pb-4">
					<h2 class="text-3xl font-bold text-white">Icons</h2>
					<p class="text-white/80">Icon components from Lucide</p>
				</div>
				<Card class="p-6">
					<div class="flex flex-wrap items-center gap-6">
						<Icon icon={Home} size="sm" />
						<Icon icon={Settings} size="md" />
						<Icon icon={User} size="lg" />
						<Icon icon={Mail} size="xl" />
						<Icon icon={Heart} variant="primary" />
						<Icon icon={Star} variant="outline" />
						<Icon icon={CheckCircle} variant="ghost" />
						<Icon icon={AlertCircle} variant="destructive" />
					</div>
				</Card>
			</section>

			<!-- Buttons with Icons Section -->
			<section class="space-y-6">
				<div class="border-b pb-4">
					<h2 class="text-3xl font-bold text-white">Buttons with Icons</h2>
					<p class="text-white/80">Buttons combined with icon elements</p>
				</div>
				<Card class="p-6">
					<div class="flex flex-wrap gap-4">
						<Button variant="primary">
							<div class="flex items-center gap-2">
								<Download class="h-4 w-4" />
								Download
							</div>
						</Button>
						<Button variant="destructive">
							<div class="flex items-center gap-2">
								<Trash class="h-4 w-4" />
								Delete
							</div>
						</Button>
						<Button variant="outline">
							<div class="flex items-center gap-2">
								<Edit class="h-4 w-4" />
								Edit
							</div>
						</Button>
						<Button variant="primary">
							<div class="flex items-center gap-2">
								Continue
								<ChevronRight class="h-4 w-4" />
							</div>
						</Button>
						<Button variant="ghost">
							<div class="flex items-center gap-2">
								Learn More
								<ChevronRight class="h-4 w-4" />
							</div>
						</Button>
					</div>
				</Card>
			</section>

			<!-- Alerts Section -->
			<section class="space-y-6">
				<div class="border-b pb-4">
					<h2 class="text-3xl font-bold text-white">Alerts</h2>
					<p class="text-white/80">Notification and message components</p>
				</div>
				<div class="space-y-4">
					<Alert variant="info" icon={Info}>This is an informational alert message.</Alert>
					<Alert variant="success" icon={CheckCircle}>This is a success alert message.</Alert>
					<Alert variant="warning" icon={AlertTriangle}>This is a warning alert message.</Alert>
					<Alert variant="destructive" icon={AlertCircle}
						>This is a destructive/error alert message.</Alert
					>
				</div>
			</section>

			<!-- Badges Section -->
			<section class="space-y-6">
				<div class="border-b pb-4">
					<h2 class="text-3xl font-bold text-white">Badges</h2>
					<p class="text-white/80">Small status indicators</p>
				</div>
				<Card class="p-6">
					<div class="flex flex-wrap items-center gap-4">
						<Badge>Default</Badge>
						<Badge variant="success">Success</Badge>
						<Badge variant="warning">Warning</Badge>
						<Badge variant="destructive">Destructive</Badge>
						<Badge variant="info">Info</Badge>
					</div>
				</Card>
			</section>

			<!-- Form Controls Section -->
			<section class="space-y-6">
				<div class="border-b pb-4">
					<h2 class="text-3xl font-bold text-white">Form Controls</h2>
					<p class="text-white/80">Input fields and form elements</p>
				</div>
				<Card class="p-6">
					<div class="grid gap-6 md:grid-cols-2">
						<FormControl label="Text Input">
							<Input bind:value={inputValue} placeholder="Enter text..." />
						</FormControl>

						<FormControl label="Select Dropdown">
							<Select bind:value={selectValue}>
								<option value="option1">Option 1</option>
								<option value="option2">Option 2</option>
								<option value="option3">Option 3</option>
							</Select>
						</FormControl>
						<FormControl label="Checkbox" class="md:col-span-2">
							<Checkbox bind:checked={checkboxValue}>I agree to the terms and conditions</Checkbox>
						</FormControl>

						<FormControl label="Radio Buttons" class="md:col-span-2">
							<div class="space-y-2">
								<Radio bind:group={radioValue} value="option1">Option 1</Radio>
								<Radio bind:group={radioValue} value="option2">Option 2</Radio>
								<Radio bind:group={radioValue} value="option3">Option 3</Radio>
							</div>
						</FormControl>

						<FormControl label="Text Area" class="md:col-span-2">
							<TextArea bind:value={textareaValue} placeholder="Enter multiple lines..." rows={4} />
						</FormControl>
					</div>
				</Card>
			</section>

			<!-- Card Section -->
			<section class="space-y-6">
				<div class="border-b pb-4">
					<h2 class="text-3xl font-bold text-white">Cards</h2>
					<p class="text-white/80">Container components</p>
				</div>
				<div class="grid gap-6 md:grid-cols-3">
					<Card class="p-6">
						<h3 class="mb-2 text-xl font-bold">Card Title</h3>
						<p class="text-muted-fg">This is a basic card component with some content inside.</p>
					</Card>
					<Card class="p-6">
						<h3 class="mb-2 text-xl font-bold">Card Title</h3>
						<p class="text-muted-fg">Another card with different content to showcase the layout.</p>
					</Card>
					<Card class="p-6">
						<h3 class="mb-2 text-xl font-bold">Card Title</h3>
						<p class="text-muted-fg">A third card to complete the grid layout example.</p>
					</Card>
				</div>
			</section>

			<!-- Link Section -->
			<section class="space-y-6">
				<div class="border-b pb-4">
					<h2 class="text-3xl font-bold text-white">Links</h2>
					<p class="text-white/80">Styled anchor elements</p>
				</div>
				<Card class="p-6">
					<div class="flex flex-wrap gap-6">
						<Link href="/" class="text-link hover:text-primary" style="text-decoration: none;"
							>Default Link</Link
						>
						<Link href="/" class="text-link hover:text-primary" style="text-decoration: none;"
							>Primary Link</Link
						>
						<Link href="/" class="text-link hover:text-alert-info" style="text-decoration: none;"
							>Info Link</Link
						>
					</div>
				</Card>
			</section>

			<!-- Accordion Section -->
			<section class="space-y-6">
				<div class="border-b pb-4">
					<h2 class="text-3xl font-bold text-white">Accordion</h2>
					<p class="text-white/80">Collapsible content panels</p>
				</div>
				<Card class="p-6">
					<Accordion label="Accordion Item 1">
						<p>
							This is the content of the first accordion item. It can contain any HTML or
							components.
						</p>
					</Accordion>
					<Accordion label="Accordion Item 2">
						<p>This is the content of the second accordion item with different information.</p>
					</Accordion>
					<Accordion label="Accordion Item 3">
						<p>This is the content of the third accordion item.</p>
					</Accordion>
				</Card>
			</section>

			<!-- Divider Section -->
			<section class="space-y-6">
				<div class="border-b pb-4">
					<h2 class="text-3xl font-bold text-white">Divider</h2>
					<p class="text-white/80">Content separator</p>
				</div>
				<Card class="p-6">
					<p>Content above divider</p>
					<Divider />
					<p>Content below divider</p>
				</Card>
			</section>

			<!-- Skeleton Section -->
			<section class="space-y-6">
				<div class="border-b pb-4">
					<h2 class="text-3xl font-bold text-white">Skeleton</h2>
					<p class="text-white/80">Loading placeholders</p>
				</div>
				<Card class="p-6">
					<div class="space-y-4">
						<Skeleton class="h-4 w-full" />
						<Skeleton class="h-4 w-3/4" />
						<Skeleton class="h-4 w-1/2" />
						<Skeleton class="h-32 w-full" />
					</div>
				</Card>
			</section>

			<!-- Tab Section -->
			<section class="space-y-6">
				<div class="border-b pb-4">
					<h2 class="text-3xl font-bold text-white">Tabs</h2>
					<p class="text-white/80">Tabbed navigation</p>
				</div>
				<Card class="p-6">
					<Tab.Triggers instance={tabInstance} />
					<Tab.View active={tabInstance.activeView === 0}>
						<div class="p-4">
							<h3 class="mb-2 text-xl font-bold">Tab 1 Content</h3>
							<p>This is the content for the first tab.</p>
						</div>
					</Tab.View>
					<Tab.View active={tabInstance.activeView === 1}>
						<div class="p-4">
							<h3 class="mb-2 text-xl font-bold">Tab 2 Content</h3>
							<p>This is the content for the second tab.</p>
						</div>
					</Tab.View>
					<Tab.View active={tabInstance.activeView === 2}>
						<div class="p-4">
							<h3 class="mb-2 text-xl font-bold">Tab 3 Content</h3>
							<p>This is the content for the third tab.</p>
						</div>
					</Tab.View>
				</Card>
			</section>

			<!-- Combo Box Section -->
			<section class="space-y-6">
				<div class="border-b pb-4">
					<h2 class="text-3xl font-bold text-white">Combo Box</h2>
					<p class="text-white/80">Searchable single- and multi-select variants</p>
				</div>
				<Card class="space-y-6 p-6">
					<div class="grid gap-6 md:grid-cols-2">
						<div class="space-y-2">
							<h3 class="text-lg font-semibold text-foreground">Single select</h3>
							<ComboBox instance={singleComboInstance} />
							<p class="text-sm text-muted-fg">
								Selected:
								{singleComboInstance.checkedItems[0]?._label ?? 'Ingen vald'}
							</p>
						</div>
						<div class="space-y-2">
							<h3 class="text-lg font-semibold text-foreground">Grouped multi-select</h3>
							<ComboBox instance={multiComboInstance} />
							<p class="text-sm text-muted-fg">
								Selected:
								{multiComboInstance.checkedItems.length
									? multiComboInstance.checkedItems.map((item) => item.name).join(', ')
									: 'Ingen vald'}
							</p>
						</div>
					</div>
				</Card>
			</section>

			<!-- Datepicker Section -->
			<section class="space-y-6">
				<div class="border-b pb-4">
					<h2 class="text-3xl font-bold text-white">Datepicker</h2>
					<p class="text-white/80">Calendar input with AirDatepicker under the hood</p>
				</div>
				<Card class="space-y-4 p-6">
					<div class="grid gap-4 md:grid-cols-2">
						<div class="space-y-2">
							<p class="font-semibold text-foreground">Pick a date</p>
							<Datepicker
								bind:value={selectedDate}
								placeholder="YYYY-MM-DD"
								options={{ dateFormat: 'yyyy-MM-dd' }}
							/>
						</div>
						<div class="space-y-2">
							<p class="font-semibold text-foreground">Inline options</p>
							<Datepicker
								bind:value={selectedDate}
								options={{ position: 'top left', dateFormat: 'yyyy-MM-dd' }}
							/>
						</div>
					</div>
					<p class="text-sm text-muted-fg">
						Selected date:
						{selectedDate || 'Ingen vald ännu'}
					</p>
				</Card>
			</section>

			<!-- Dropdown Section -->
			<section class="space-y-6">
				<div class="border-b pb-4">
					<h2 class="text-3xl font-bold text-white">Dropdown</h2>
					<p class="text-white/80">Hover/focus activated menus with optional icons</p>
				</div>
				<Card class="flex flex-wrap gap-4 p-6">
					<Dropdown.Root trigger={{ label: 'Profile menu', rightIcon: ChevronDown }}>
						<Dropdown.Item leftIcon={User}>Profile</Dropdown.Item>
						<Dropdown.Item leftIcon={Settings}>Settings</Dropdown.Item>
						<Dropdown.Item leftIcon={LogOut}>Log out</Dropdown.Item>
					</Dropdown.Root>

					<Dropdown.Root align="left" trigger={{ label: 'Quick actions', leftIcon: Menu }}>
						<Dropdown.Item>Duplicate</Dropdown.Item>
						<Dropdown.Item disabled>Archive</Dropdown.Item>
						<Dropdown.Item leftIcon={Download}>Download</Dropdown.Item>
					</Dropdown.Root>
				</Card>
			</section>

			<!-- Drawer Section -->
			<section class="space-y-6">
				<div class="border-b pb-4">
					<h2 class="text-3xl font-bold text-white">Drawer</h2>
					<p class="text-white/80">Slide-over / modal variants</p>
				</div>
				<Card class="space-y-4 p-6">
					<p class="text-muted-fg">
						Try all variants: right, left, top, bottom, and modal (centered) drawers.
					</p>
					<div class="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
						<Button variant="primary" onclick={() => (drawerRightOpen = true)}>
							<div class="flex items-center gap-2">
								<Menu class="h-4 w-4" />
								Right drawer
							</div>
						</Button>
						<Button variant="outline" onclick={() => (drawerLeftOpen = true)}>Left drawer</Button>
						<Button variant="ghost" onclick={() => (drawerTopOpen = true)}>Top drawer</Button>
						<Button variant="inverted" class="text-white" onclick={() => (drawerBottomOpen = true)}>
							Bottom drawer
						</Button>
						<Button variant="destructive-outline" onclick={() => (drawerModalOpen = true)}>
							Modal drawer
						</Button>
					</div>
				</Card>
				<Drawer
					bind:open={drawerRightOpen}
					variant="right"
					title="Notifications"
					subtitle="Click outside or the close icon to dismiss"
					dismissable
				>
					<div class="space-y-3">
						<p class="text-sm text-muted-fg">
							Use drawers for quick secondary flows without leaving the page.
						</p>
						<Alert variant="info" icon={Info}>Drawer content accepts any blocks or forms.</Alert>
					</div>
				</Drawer>
				<Drawer
					bind:open={drawerLeftOpen}
					variant="left"
					title="Navigation"
					subtitle="Left anchored drawer with dismiss support"
					dismissable
				>
					<div class="space-y-3">
						<Button variant="ghost" class="justify-start">Dashboard</Button>
						<Button variant="ghost" class="justify-start">Projects</Button>
						<Button variant="ghost" class="justify-start">Settings</Button>
					</div>
				</Drawer>
				<Drawer
					bind:open={drawerTopOpen}
					variant="top"
					title="Banner drawer"
					subtitle="Slides down from the top edge"
					dismissable
				>
					<p class="text-sm text-muted-fg">Use top drawers for announcements or quick filters.</p>
				</Drawer>
				<Drawer
					bind:open={drawerBottomOpen}
					variant="bottom"
					title="Bottom sheet"
					subtitle="Mobile-style sheet that slides up"
					dismissable
				>
					<div class="space-y-3">
						<p class="text-sm text-muted-fg">Attach actions that need extra context.</p>
						<Button variant="primary">Confirm action</Button>
					</div>
				</Drawer>
				<Drawer
					bind:open={drawerModalOpen}
					variant="modal"
					title="Centered modal"
					subtitle="Uses the modal variant for dialogs"
					dismissable
				>
					<div class="space-y-3">
						<p class="text-sm text-muted-fg">Perfect for confirmations and short forms.</p>
						<div class="flex gap-3">
							<Button variant="primary" onclick={() => (drawerModalOpen = false)}>Continue</Button>
							<Button variant="ghost" onclick={() => (drawerModalOpen = false)}>Cancel</Button>
						</div>
					</div>
				</Drawer>
			</section>

			<!-- File Zone Section -->
			<section class="space-y-6">
				<div class="border-b pb-4">
					<h2 class="text-3xl font-bold text-white">File Zone</h2>
					<p class="text-white/80">Drag-and-drop uploads with status feedback</p>
				</div>
				<Card class="space-y-4 p-6">
					<FileZone
						bind:files={uploadedFiles}
						isSubmitting={isSubmittingFile}
						accept=".csv,.xlsx,.xls"
					/>
					<div class="flex flex-wrap gap-3">
						<Button variant="primary" onclick={simulateUploadCheck} disabled={isSubmittingFile}>
							<div class="flex items-center gap-2">
								<Upload class="h-4 w-4" />
								Validate upload
							</div>
						</Button>
						<Button
							variant="ghost"
							onclick={() => (uploadedFiles = undefined)}
							disabled={isSubmittingFile}
						>
							Clear
						</Button>
					</div>
				</Card>
			</section>

			<!-- Lookup Section -->
			<section class="space-y-6">
				<div class="border-b pb-4">
					<h2 class="text-3xl font-bold text-white">Lookup</h2>
					<p class="text-white/80">Typeahead search with keyboard navigation</p>
				</div>
				<Card class="space-y-3 p-6">
					<Lookup
						instance={lookupInstance}
						placeholder="Sök efter profil..."
						onselect={handleLookupSelect}
					/>
					<p class="text-sm text-muted-fg">
						{#if selectedLookup}
							Vald: {selectedLookup.name} ({selectedLookup.role})
						{:else}
							Ingen profil vald ännu.
						{/if}
					</p>
				</Card>
			</section>

			<!-- Mode Switcher Section -->
			<section class="space-y-6">
				<div class="border-b pb-4">
					<h2 class="text-3xl font-bold text-white">Mode Switcher</h2>
					<p class="text-white/80">Light/dark toggle using mode-watcher</p>
				</div>
				<Card class="space-y-4 p-6">
					<div class="flex flex-wrap items-center gap-4">
						<Mode.Switch variant="outline" size="sm" />
						<Mode.Switch variant="primary" size="md" />
						<Mode.Switch variant="ghost" size="lg" />
					</div>
					<p class="text-sm text-muted-fg">The Mode.Watcher is mounted at the top of this page.</p>
				</Card>
			</section>

			<!-- Toast Section -->
			<section class="space-y-6">
				<div class="border-b pb-4">
					<h2 class="text-3xl font-bold text-white">Toast</h2>
					<p class="text-white/80">Transient notifications powered by svelte-sonner</p>
				</div>
				<Card class="flex flex-wrap gap-3 p-6">
					<Button variant="primary" onclick={() => toast('Sparat!')}>Fire toast</Button>
					<Button
						variant="outline"
						onclick={() => toast.success?.('Allt ser bra ut!') ?? toast('Allt ser bra ut!')}
					>
						Success
					</Button>
					<Button
						variant="destructive"
						onclick={() => toast.error?.('Något gick fel') ?? toast('Något gick fel')}
					>
						Error
					</Button>
				</Card>
			</section>

			<!-- Super Table Section -->
			<section class="space-y-6">
				<div class="border-b pb-4">
					<h2 class="text-3xl font-bold text-white">Super Table</h2>
					<p class="text-white/80">Sortable, filterable data table with rich cells</p>
				</div>
				<Card class="space-y-4 p-6">
					<SuperTable instance={invoiceTable}>
						{#each invoiceTable.data as row}
							<Row.Root>
								<Cell.Value class="font-semibold">#{row.id}</Cell.Value>
								<Cell.Value>
									<div class="flex flex-col">
										<span class="font-semibold text-foreground">{row.customer}</span>
										<span class="text-xs text-muted-fg">Owner: {row.owner}</span>
									</div>
								</Cell.Value>
								<Cell.Value>
									<Badge
										variant={row.status === 'Paid'
											? 'success'
											: row.status === 'Pending'
												? 'warning'
												: 'destructive'}
									>
										{row.status}
									</Badge>
								</Cell.Value>
								<Cell.Value class="text-right font-semibold">
									{formatCurrency(row.total)}
								</Cell.Value>
								<Cell.Date date={row.date} class="text-nowrap" />
								<Cell.Action callback={() => toast(`Öppnade faktura #${row.id}`)} variant="ghost">
									Öppna
								</Cell.Action>
							</Row.Root>
						{/each}
					</SuperTable>
				</Card>
			</section>
		</div>
	</div>
</div>
