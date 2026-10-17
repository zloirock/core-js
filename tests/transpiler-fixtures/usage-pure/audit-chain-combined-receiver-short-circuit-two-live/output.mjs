import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
// a receiver carrying its OWN live `?.` short-circuits the whole chain at that link, so the
// combined dispatch tests the link's object before the maybe-helper reads the receiver past it;
// a receiver that comes out nullish below the link still throws at that read, as native does
export function twoLive(a) {
  var _ref, _ref3, _ref2, _ref4;
  return null == (_ref = a?.b) || null == (_ref2 = _flatMaybeArray(_ref3 = _ref.c)) ? void 0 : _mapMaybeArray(_ref4 = _ref2.call(_ref3)).call(_ref4, x => x).length;
}