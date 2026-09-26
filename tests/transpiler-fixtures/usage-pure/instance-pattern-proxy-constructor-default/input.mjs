// A constructor navigation used as a parameter default supplies an instance slot.
// The synth runs only for the omitted argument; a caller's own name stays visible.
export function read({ name } = globalThis.Symbol) { return name; }
export const supplied = read({ name: 'caller' });
