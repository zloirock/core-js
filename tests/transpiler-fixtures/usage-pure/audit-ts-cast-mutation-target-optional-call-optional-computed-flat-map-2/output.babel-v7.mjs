import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
var _ref, _ref2;
// ... and the enum whose SLOT the program rewrites: the declared value is no longer the runtime key,
// so the claim stands down whichever channel does the rewriting - a member write, or a call handed
// the container itself (the write index is keyed by assigned field and cannot see the second)
enum Patched {
  MAP = 'map',
}
export const r8 = null == (_ref = _flatMaybeArray(arr)) ? void 0 : _mapMaybeArray(_ref2 = _ref.call(arr)).call(_ref2, f);