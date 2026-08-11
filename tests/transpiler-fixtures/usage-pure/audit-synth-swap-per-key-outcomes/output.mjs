import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// SYNTH-SWAP: the outcomes are not ranked alternatives, they are chosen PER KEY and coexist in one
// pattern - a polyfillable key leaves the pattern as its own binding, an unknown key stays in the
// pattern with the receiver substituted. a rest element keeps a residual pattern beside the
// extracted binding, and in a parameter default, where no literal can be built, nothing is rewritten
const {
  foo
} = _globalThis.Array;
const from = _Array$from;
const of = _Array$of;
const {
  bar
} = _globalThis.Array;
const groupBy = _Map$groupBy;
const {
  groupBy: _unused,
  ...rest
} = _Map;
export function g({
  at,
  ...r
} = 'ab') {
  return [at, r];
}
export const a = [foo, from, of, bar, groupBy, rest];