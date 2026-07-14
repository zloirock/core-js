import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
var _ref;
// a deopted Symbol (slot write records file-wide) keeps the pattern-valued prop verbatim -
// no iterator-method extraction, no well-known-symbol substitution - while the
// receiver-independent inner default still polyfills. isolated file: the slot write would
// poison every other pattern-value row
Symbol = shim;
const {
  [Symbol.iterator]: {
    next: rawNext = _flatMaybeArray(_ref = [1]).call(_ref)
  },
  fourth
} = [5, 6];
export const viaDeoptedSymbol = [rawNext, fourth];