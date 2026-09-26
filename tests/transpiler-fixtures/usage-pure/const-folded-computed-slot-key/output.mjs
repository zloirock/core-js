import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
// a computed key a const binding folds names the slot it reads, the way the spelled key does: global
// injects the static the slot's constructor carries, pure keeps that constructor's namespace and
// reads the static raw off it
const o = {
  g: _Map,
  p: _Promise
};
const k = 'g';
const key = `p`;
export const grouped = o[k].groupBy([1], x => x);
export const attempted = o[key].try(() => 1);