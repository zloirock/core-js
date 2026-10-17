import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$getOwnPropertySymbols from "@core-js/pure/actual/object/get-own-property-symbols";
import _Symbol$asyncIterator from "@core-js/pure/actual/symbol/async-iterator";
// a VERBATIM computed sibling + consumed static under one anchored ctor: the static
// extraction rides the discarded-value slot (polyfill always wins - a default-injection
// fallback would let a buggy-but-present native shadow it), the computed key re-keys in
// the re-anchored residual
let avx, fvx;
({
  Array: {
    [_Symbol$asyncIterator]: avx,
    from: fvx
  }
} = {
  Array: {
    [_Symbol$asyncIterator]: _globalThis.Array[_Symbol$asyncIterator],
    from: _Array$from
  }
});
export const getOwnPropertySymbols = _Object$getOwnPropertySymbols;
export { avx };
export { fvx };