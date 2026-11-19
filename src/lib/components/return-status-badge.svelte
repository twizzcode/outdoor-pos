<script lang="ts">
	import { Badge } from '#lib/components/ui/badge';

	let { status }: { status: string } = $props();
	const styles: Record<string, string> = {
		Menunggu:
			'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300',
		'Jatuh tempo':
			'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300',
		Terlambat:
			'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300',
		Selesai:
			'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300'
	};
</script>

<Badge variant="outline" class={styles[status] ?? ''}>{status}</Badge>
