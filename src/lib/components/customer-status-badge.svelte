<script lang="ts">
	import { Badge } from '#lib/components/ui/badge';

	let { status }: { status: string } = $props();
</script>

<Badge
	variant="outline"
	class={status === 'Aktif'
		? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300'
		: 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300'}
>
	{status}
</Badge>
