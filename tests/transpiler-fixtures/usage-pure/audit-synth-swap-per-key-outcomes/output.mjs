import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
const {
  foo
} = _globalThis.Array;
const from = _Array$from;
const of = _Array$of;
const {
  bar
} = _globalThis.Array;
const {
  groupBy,
  ...rest
} = _Map;
export function g({
  at,
  ...r
} = 'ab') {
  return [at, r];
}
export const a = [foo, from, of, bar, groupBy, rest];