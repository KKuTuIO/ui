import '@testing-library/jest-dom/vitest';

// jsdom has no Web Animations API; Svelte transitions need `element.animate`. Finish instantly.
if (!Element.prototype.animate) {
	Element.prototype.animate = function () {
		return {
			cancel() {},
			finish() {},
			finished: Promise.resolve(),
			set onfinish(fn) {
				queueMicrotask(() => fn?.());
			}
		};
	};
}
