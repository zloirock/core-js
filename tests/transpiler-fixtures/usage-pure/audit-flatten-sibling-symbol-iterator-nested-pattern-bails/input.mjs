// `[Symbol.iterator]: {next}` - the value is a nested ObjectPattern, NOT a binding
// Identifier, so synth-extraction bails (no single binding). but the computed key still
// substitutes `[Symbol.iterator]` -> `[_Symbol$iterator]` so the destructure survives on
// engines without native `Symbol.iterator`; the preserved init keeps user binding `obj`
const obj = globalThis;
const { Array: { from }, [Symbol.iterator]: { next } } = obj;
console.log(from, next);
