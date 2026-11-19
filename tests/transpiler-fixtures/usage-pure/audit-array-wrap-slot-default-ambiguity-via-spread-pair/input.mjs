// A slot default is default-or-runtime: it fires only when the paired value IS undefined at runtime.
let t = [{}, {}];
// spread-shifted pair: the pair is unknown, the default may or may not fire - the static read
// takes the runtime identity guard against the lone candidate instead of a substitution
const [s0, { Array: A } = globalThis] = [...t];
export const viaSpreadPair = A.from([1, 2]);
