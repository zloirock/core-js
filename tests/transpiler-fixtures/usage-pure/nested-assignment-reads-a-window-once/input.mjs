// The first extracted binding owns the source read and its prefix when the pattern disappears.
export let of;
({ Array: { of } } = (prefix(), globalThis).window);
