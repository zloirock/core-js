import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$keys from "@core-js/pure/actual/object/keys";
// a synth-swap receiver with SE buried along its member spine re-emits the receiver ahead
// of the literal (rescue): the effect keeps running, the proxy root substitutes inside the
// re-emitted text, and the literal alone (which once replaced the receiver outright) no
// longer drops the effect. an effect-free receiver keeps the bare literal - no extra read
export function f({
  from
} = ((eff(), _globalThis).Array, {
  from: _Array$from
})) {
  return from;
}
export function g({
  of: o2
} = {
  of: _Array$of
}) {
  return o2;
}
export function h({
  keys
} = cond ? ((eff2(), _globalThis).Object, {
  keys: _Object$keys
}) : {
  keys: _Object$keys
}) {
  return keys;
}
// multiple buried effects keep source order; an assignment-form host harvests the same way
export function k({
  entries
} = ((a(), b(), _globalThis).Object, {
  entries: _Object$entries
})) {
  return entries;
}
let from2;
(eff3(), _globalThis).Array;
from2 = _Array$from;
export const r = from2;