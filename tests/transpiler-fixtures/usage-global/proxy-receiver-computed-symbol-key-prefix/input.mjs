// Collapsing a sealed proxy receiver preserves its prefix and computed hop effects.
// The receiver value is selected before the later computed symbol-key effect.
export const result = (prefix(), globalThis?.[(hop(), 'self')]).window[(key(), Symbol.iterator)]();
