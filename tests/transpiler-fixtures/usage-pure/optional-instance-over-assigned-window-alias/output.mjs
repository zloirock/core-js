import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
var _ref;
// An alias assigned after declaration keeps its optional receiver guard.
// The instance read uses the held list and evaluates its argument only when present.
let realm;
realm = _globalThis.window;
export const value = realm == null ? void 0 : (_at(_ref = realm.list) || 0).call(_ref, index());