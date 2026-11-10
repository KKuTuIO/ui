<script>
	import { fly } from 'svelte/transition';
	import Icon from './Icon.svelte';
	import { dismiss, pause, resume } from './toast.svelte.js';

	/** @type {{toast:{id:number,message:string,kind:string,icon?:string}, closeLabel?:string, icon?:import('svelte').Snippet<[any]>}} */
	let { toast, closeLabel = '닫기', icon } = $props();

	// Material Symbols glyph per kind, used when the host gives no `icon` snippet.
	const iconFor = { info: 'info', success: 'check_circle', warn: 'warning', error: 'error' };

	const THRESHOLD = 70; // px of horizontal drag that counts as a swipe-away
	let dx = $state(0);
	let dragging = $state(false);
	let startX = 0;
	let leaveX = $state(0);

	function down(e) {
		if (e.target.closest('button')) return;
		dragging = true;
		startX = e.clientX;
		e.currentTarget.setPointerCapture(e.pointerId);
		pause(toast.id);
	}
	function move(e) {
		if (dragging) dx = e.clientX - startX;
	}
	function up() {
		if (!dragging) return;
		dragging = false;
		if (Math.abs(dx) > THRESHOLD) {
			leaveX = Math.sign(dx) * 320;
			dismiss(toast.id);
		} else {
			dx = 0;
			resume(toast.id);
		}
	}
</script>

<div
	in:fly={{ y: -20, duration: 220 }}
	out:fly={{ x: leaveX, y: leaveX ? 0 : -12, duration: 160 }}
	role={toast.kind === 'error' ? 'alert' : 'status'}
	onpointerdown={down}
	onpointermove={move}
	onpointerup={up}
	onpointercancel={up}
	onpointerenter={() => pause(toast.id)}
	onpointerleave={() => !dragging && resume(toast.id)}
	onfocusin={() => pause(toast.id)}
	onfocusout={() => resume(toast.id)}
	style:transform="translateX({dx}px)"
	style:opacity={dragging ? Math.max(0.35, 1 - Math.abs(dx) / 260) : 1}
	class="group pointer-events-auto relative flex w-fit max-w-[min(24rem,100%)] cursor-grab touch-pan-y items-center gap-2.5 rounded-xl border-[1.5px] border-(color:--kk-line-strong) bg-(--kk-surface) py-2.5 pr-3 pl-3 text-sm font-bold text-(color:--kk-text) shadow-[0_2px_0_var(--kk-line-strong)] select-none {dragging ? 'cursor-grabbing' : 'transition-[transform,opacity] duration-200'}"
>
	{#if icon}{@render icon(toast)}{:else}<Icon name={toast.icon ?? iconFor[toast.kind] ?? 'info'} class="shrink-0" />{/if}
	<span class="min-w-0 break-keep">{toast.message}</span>
	<button
		type="button"
		aria-label={closeLabel}
		onclick={() => dismiss(toast.id)}
		class="grid size-6 shrink-0 place-items-center rounded-full text-(color:--kk-muted) opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 hover:bg-(--kk-surface-2) focus-visible:opacity-100"
	><Icon name="close" size={16} /></button>
</div>
