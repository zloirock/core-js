import _globalThis from "@core-js/pure/actual/global-this";
import _isIterable from "@core-js/pure/actual/is-iterable";
import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise";
import _Symbol from "@core-js/pure/actual/symbol";
var _ref, _ref2;
// a slot whose only install never runs in this build stays the build's own, so the identity guards over a
// selection reaching it keep their pure branch: a realm selection, a container whose `var` may not be
// initialized, and a realm's iterability test
if (typeof _Promise == 'undefined') _globalThis.Promise = PromiseShim;
if (typeof _Map == 'undefined') _globalThis.Map = MapShim;
if (typeof _Symbol == 'undefined') _globalThis.Symbol = SymbolShim;
export const viaRealm = (_ref = g || _globalThis, _ref === _globalThis ? _Promise : _ref.Promise).resolve(1);
if (c) {
  var box = {
    M: _Map
  };
}
export const viaBox = (_ref2 = box.M, _ref2 === _Map ? _Map$groupBy(list, key) : _ref2.groupBy(list, key));
if (c) {
  var realm = _globalThis;
}
export const viaIn = realm === _globalThis ? _isIterable(list) : realm.Symbol.iterator in list;