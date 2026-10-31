import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
// a for-of head over the realm names the realm only while the head is its sole write: a head the body or a
// later statement reassigns may hold the replacement at the read, which keeps its live value. usage-pure
// only: the global flavor injects either way
for (let g of [_globalThis]) {
  if (c) g = {
    Map: MapShim
  };
  use((g === _globalThis ? _Map : g.Map).groupBy(list, key));
}
for (var h of [_globalThis]) _pushMaybeArray(later).call(later, () => (h === _globalThis ? _Promise : h.Promise).resolve(1));
h = {
  Promise: PromiseShim
};