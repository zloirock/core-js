import _globalThis from "@core-js/pure/actual/global-this";
import _isIterable from "@core-js/pure/actual/is-iterable";
import _Promise from "@core-js/pure/actual/promise";
var _ref;
// member reads that run before every write of a global's slot see the slot this build serves, so the
// guards over them keep their pure branch: a realm selection read off directly and a realm's
// iterability test
export const viaRealm = (_ref = g || _globalThis, _ref === _globalThis ? _Promise : _ref.Promise).resolve(1);
if (c) {
  var realm = _globalThis;
}
export const viaIn = realm === _globalThis ? _isIterable(list) : realm.Symbol.iterator in list;
_globalThis.Promise = PromiseShim;
_globalThis.Symbol = SymbolShim;