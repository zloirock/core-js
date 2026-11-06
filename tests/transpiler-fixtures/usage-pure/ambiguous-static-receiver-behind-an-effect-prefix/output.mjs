import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator from "@core-js/pure/actual/iterator";
import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
import _URL from "@core-js/pure/actual/url";
var _ref;
// an effect prefix ahead of a receiver runs where the read stands and names nothing: the read lands
// on the prefix's tail, so a receiver that may hold more than one value takes the whole entry behind
// a prefix exactly as it does bare - a slot of a selection, a slot of disagreeing returns, a member
// under an opaque iteration and a selecting realm alike
const on = [1].length > 0;
const box = on ? {
  A: _Promise
} : {
  A: _Map
};
export const viaSlot = (tick(), box.A).allSettled([]);
function make() {
  if (on) return {
    A: _Map
  };
  return {
    A: _Promise
  };
}
export const viaReturns = (tick(), make().A).groupBy([], x => x);
export function viaIteration(source) {
  for (const item of [{
    A: _Iterator
  }, ...source]) return (tick(), item.A).from([1]);
}
function realm() {
  return _globalThis;
}
export const viaRealm = (tick(), _ref = on ? realm() : other(), _ref === _globalThis ? _URL : _ref.URL).canParse('a:b');