// A guarded native constructor read keeps its default and the claims inside it.
let saved;
const { Map: { name } = ([1].at(0), fallback()) } = (saved = globalThis.window?.self);
export {};
