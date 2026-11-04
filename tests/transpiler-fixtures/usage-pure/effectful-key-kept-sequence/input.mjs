// A computed window read can throw before the assignment reaches its optional consumer.
let root, held;
export const value = (root = globalThis, held = root[(effect(), 'window')].self)?.Array.prototype.at;
export { held };
