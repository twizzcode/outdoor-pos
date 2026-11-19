<script lang="ts">
	import { Badge } from '#lib/components/ui/badge';

	let { status }: { status: string } = $props();
	const styles: Record<string, string> = {
		'Menunggu pemeriksaan':
			'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300',
		'Menunggu perbaikan':
			'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300',
		'Sedang dikerjakan':
			'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950 dark:text-violet-300',
		Selesai:
			'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300',
		'Tidak dapat diperbaiki':
			'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300'
	};
</script>

<Badge variant="outline" class={styles[status] ?? ''}>{status}</Badge>
