import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import Select from '../lib/Select.svelte';
import ToastHost from '../lib/ToastHost.svelte';
import { dismiss, toast, toasts } from '../lib/toast.svelte.js';

afterEach(cleanup);

describe('toast', () => {
	it('queues, caps at four and dismisses', () => {
		const ids = Array.from({ length: 6 }, (_, i) => toast(`m${i}`, { duration: 0 }));
		expect(toasts.length).toBe(4);
		dismiss(ids[5]);
		expect(toasts.length).toBe(3);
		toasts.splice(0);
	});
	it('renders in the host with a labelled close button that dismisses it', async () => {
		render(ToastHost, { closeLabel: 'Close' });
		toast('saved', { kind: 'success', duration: 0 });
		const item = await screen.findByText('saved');
		expect(item).toBeInTheDocument();
		await fireEvent.click(screen.getByRole('button', { name: 'Close', hidden: true }));
		expect(toasts.length).toBe(0);
	});
});

// jsdom doesn't implement popovers, so it reports the list as hidden; real-browser behaviour is checked separately.
describe('Select', () => {
	const options = [{ value: 1, label: 'Apple' }, { value: 2, label: 'Banana' }, { value: 3, label: 'Cherry' }];
	it('opens with the keyboard, moves, selects and closes on Escape', async () => {
		const onchange = vi.fn();
		render(Select, { options, value: 1, label: 'fruit', onchange });
		const box = screen.getByRole('combobox');
		expect(box.getAttribute('aria-expanded')).toBe('false');
		await fireEvent.keyDown(box, { key: 'ArrowDown' });
		expect(box.getAttribute('aria-expanded')).toBe('true');
		expect(screen.getAllByRole('option', { hidden: true }).length).toBe(3);
		await fireEvent.keyDown(box, { key: 'ArrowDown' });
		await fireEvent.keyDown(box, { key: 'Enter' });
		expect(onchange).toHaveBeenCalledWith(2);
		expect(box.textContent).toContain('Banana');
		expect(box.getAttribute('aria-expanded')).toBe('false');
		await fireEvent.keyDown(box, { key: 'ArrowDown' });
		await fireEvent.keyDown(box, { key: 'Escape' });
		expect(screen.queryAllByRole('option', { hidden: true }).length).toBe(0);
	});
	it('picks an option by click', async () => {
		render(Select, { options, value: 1, label: 'fruit' });
		await fireEvent.click(screen.getByRole('combobox'));
		await fireEvent.click(screen.getByRole('option', { name: /Cherry/, hidden: true }));
		expect(screen.getByRole('combobox').textContent).toContain('Cherry');
	});
});

describe('Select with disabled options', () => {
	const options = [{ value: 1, label: 'Score' }, { value: 2, label: 'Trophy', disabled: true, badge: 'Soon' }, { value: 3, label: 'Other' }];
	it('shows them as unavailable, skips them with the keyboard and ignores clicks', async () => {
		const onchange = vi.fn();
		render(Select, { options, value: 1, label: 'kind', onchange });
		const box = screen.getByRole('combobox');
		await fireEvent.keyDown(box, { key: 'ArrowDown' }); // open
		const trophy = screen.getByRole('option', { name: /Trophy/, hidden: true });
		expect(trophy.getAttribute('aria-disabled')).toBe('true');
		expect(trophy.textContent).toContain('Soon');
		await fireEvent.keyDown(box, { key: 'ArrowDown' }); // skips Trophy
		await fireEvent.keyDown(box, { key: 'Enter' });
		expect(onchange).toHaveBeenCalledWith(3);
		await fireEvent.keyDown(box, { key: 'ArrowDown' });
		await fireEvent.click(screen.getByRole('option', { name: /Trophy/, hidden: true }));
		expect(onchange).toHaveBeenCalledTimes(1);
	});
});
