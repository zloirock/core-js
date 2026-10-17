// a VERBATIM computed sibling + consumed static under one anchored ctor: the static
// extraction rides the discarded-value slot (polyfill always wins - a default-injection
// fallback would let a buggy-but-present native shadow it), the computed key re-keys in
// the re-anchored residual
let avx, fvx;
export const { getOwnPropertySymbols } = (({ Array: { [Symbol.asyncIterator]: avx, from: fvx } } = globalThis), Object);
export { avx };
export { fvx };
