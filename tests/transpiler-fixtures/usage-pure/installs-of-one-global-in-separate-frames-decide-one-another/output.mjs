import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Set from "@core-js/pure/actual/set/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// installs of one global, each under a presence test in a frame of its own - bundled modules each shimming it -
// decide one another: with none of them running, every test reads what the build serves, so none runs and every
// read takes the pure import. two functions, a top-level install beside one in a function, and a realm alias
// the functions share decide alike
function installMap() {
  if (!_Map) _globalThis.Map = MapShim;
}
function installMapAgain() {
  if (!_Map) _globalThis.Map = MapShim;
}
export const grouped = _Map$groupBy(list, key);
if (typeof _Set == 'undefined') _globalThis.Set = SetShim;
function installSet() {
  if (typeof _Set == 'undefined') _globalThis.Set = SetShim;
}
export const unique = new _Set(list);
const realm = _globalThis;
function installWeakMap() {
  if (!_WeakMap) realm.WeakMap = WeakMapShim;
}
function installWeakMapAgain() {
  if (!_WeakMap) realm.WeakMap = WeakMapShim;
}
export const cache = new _WeakMap();