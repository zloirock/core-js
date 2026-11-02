// A prefix cannot turn a stored nullable receiver into a defined constructor.
let saved;
const { Map: { name } } = (effect(), saved = globalThis.window?.self);
export {};
