// An effect inside the inner default runs once, with its inner polyfill preserved.
let se = () => {};
const { [Symbol.iterator]: { next: seNext = (se(), [1].toReversed()) }, third } = [8, 9];
export const viaSeDefault = [seNext, third];
