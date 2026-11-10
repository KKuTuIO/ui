<script>
	/**
	 * A Material Symbols glyph. The font comes from `icons.css` (or any stylesheet that defines `.material-symbols-outlined`).
	 * @type {{name:string, size?:number, fill?:boolean, weight?:number, class?:string}}
	 */
	let { name, size = 20, fill = false, weight = 400, class: cls = '' } = $props();
</script>

<span class="material-symbols-outlined leading-none select-none {cls}" aria-hidden="true" style="font-size:{size}px;font-variation-settings:'FILL' {fill ? 1 : 0}, 'wght' {weight}">{name}</span>
