import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _self from "@core-js/pure/actual/self";
// The closed true selector gives both defaults their direct Array arm; the deep proxy alternate stays
// only as the native fallback spelling. Two live deep proxy arms remain covered by
// `audit-per-branch-synth-deep-proxy-chain`.
const cond = true;
function f({
  from
} = cond ? {
  from: _Array$from
} : _self.Array) {
  return from([1]);
}
function g({
  of
} = cond ? {
  of: _Array$of
} : _self.Array) {
  return of(2, 3);
}
export { f, g };