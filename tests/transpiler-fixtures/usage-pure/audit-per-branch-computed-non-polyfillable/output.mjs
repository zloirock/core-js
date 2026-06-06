import _Array$from from "@core-js/pure/actual/array/from";
import _Set from "@core-js/pure/actual/set/constructor";
// a computed-key sibling that does NOT resolve to a polyfillable static (`const k = "zzz"`) must not bail
// the whole per-branch synth: the polyfillable shorthand `from` still synthesizes `_Array$from` while
// the non-polyfillable computed key is preserved as a plain `receiver[k]` access on each viable branch
const k = "zzz";
const cond = Math.random() > 0.5;
const {
  [k]: x,
  from
} = cond ? {
  [k]: Array[k],
  from: _Array$from
} : _Set;
[x, from];