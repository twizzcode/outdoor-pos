<script lang="ts">
	import { Badge } from '#lib/components/ui/badge';

	let { status }: { status: string } = $props();

	const styles: Record<string, string> = {
		Draft:
			'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300',
		Dikonfirmasi:
			'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950 dark:text-violet-300',
		'Siap diambil':
			'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300',
		Dikonversi:
			'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300',
		Dibatalkan:
			'border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400'
	};
</script>

<Badge variant="outline" class={styles[status] ?? ''}>{status}</Badge>
