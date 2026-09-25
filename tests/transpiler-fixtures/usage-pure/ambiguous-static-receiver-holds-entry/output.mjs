import _Iterator from "@core-js/pure/actual/iterator";
import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
import _URL from "@core-js/pure/actual/url";
// a static read on a receiver that may hold more than one value names no single constructor, so pure
// reads it raw off whatever arrived - and an arm it minted a pure constructor into has to be the
// whole entry, which carries that constructor's statics. usage-global injects for every candidate
const on = [1].length > 0;
const off = [].pop();
export const viaSelection = (on ? _Map : _Promise).groupBy([1, 2], x => x % 2);
const alias = off || _Iterator;
export const viaAlias = alias.from([1]);
const box = on ? {
  A: _Promise
} : {
  A: _Map
};
export const viaSlot = box.A.withResolvers();
function make() {
  if (on) return {
    A: _URL
  };
  return {
    A: _Map
  };
}
export const viaReturns = make().A.canParse('a:b');