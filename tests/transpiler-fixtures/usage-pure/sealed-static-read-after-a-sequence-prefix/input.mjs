// A prefix of the tested window runs once, including when the sealed property read throws.
export const value = typeof ((prefix(), globalThis.window)?.Array).from;
