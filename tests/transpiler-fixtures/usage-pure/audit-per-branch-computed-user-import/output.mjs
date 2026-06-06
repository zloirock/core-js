import _Array$from from "@core-js/pure/actual/array/from";
import _Set from "@core-js/pure/actual/set/constructor";
// a genuine USER-import computed key (`import X from "x"; { [X]: it, from }`) in a conditional receiver
// is replayed losslessly as `[X]: receiver[X]` while the polyfillable sibling `from` still synthesizes
// `_Array$from`. the gate bails only a bare global or a polyfill-rewritten (core-js-sourced) symbol
// import, NOT a user import, so the sibling polyfill is not dropped
import X from "x";
const cond = Math.random() > 0.5;
const {
  [X]: it,
  from
} = cond ? {
  [X]: Array[X],
  from: _Array$from
} : _Set;
[from([1]), it];