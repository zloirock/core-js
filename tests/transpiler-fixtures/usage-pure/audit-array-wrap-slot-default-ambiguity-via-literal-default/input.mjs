// A slot default is default-or-runtime: it fires only when the paired value IS undefined at runtime.
let t = [{}, {}];
// literal object default with an unknown pair bails the same way
const [l0, { ns: N } = { ns: Iterator }] = [...t];
export const viaLiteralDefault = N.range(0, 3);
