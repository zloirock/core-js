import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _self from "@core-js/pure/actual/self";
import _Set from "@core-js/pure/actual/set/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
import _WeakSet from "@core-js/pure/actual/weak-set/constructor";
// a presence test of a realm member decides like its `typeof` twin: the build serves the global, so the
// install under it never runs and the user's shim never reaches the global object - off `globalThis` or
// `self`, through `window` (pure respells the probe away), a realm alias or a `||` install alike
if (!_Promise) _globalThis.Promise = PromiseShim;
if (!_Map) _self.Map = MapShim;
if (!_Iterator) window.Iterator = IteratorShim;
if (typeof _WeakMap == 'undefined') _globalThis.WeakMap = WeakMapShim;
const G = _globalThis;
if (!_WeakSet) G.WeakSet = WeakSetShim;
export const settled = _Promise$allSettled([]);
export const grouped = _Map$groupBy(list, key);
export const iter = _Iterator$from(list);
export const weak = [new _WeakMap(), new _Set(), new _WeakSet()];