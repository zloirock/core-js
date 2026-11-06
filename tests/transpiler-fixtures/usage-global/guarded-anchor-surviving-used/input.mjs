// A used assignment retains the RHS while the claim guards its constructor read.
let saved, name;
const result = ({ Map: { name } } = (saved = globalThis.window?.self));
export {};
