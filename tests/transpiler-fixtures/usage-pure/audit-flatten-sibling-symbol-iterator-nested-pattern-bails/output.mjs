import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// `[Symbol.iterator]: {next}` - the value is a nested ObjectPattern, NOT a binding
// Identifier, so synth-extraction bails (no single binding). but the computed key still
// substitutes `[Symbol.iterator]` -> `[_Symbol$iterator]` so the destructure survives on
// engines without native `Symbol.iterator`; the preserved init keeps user binding `obj`
const obj = _globalThis;
const from = _Array$from;
const {
  [_Symbol$iterator]: {
    next
  }
} = obj;
console.log(from, next);