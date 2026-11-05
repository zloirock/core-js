import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _at from "@core-js/pure/actual/instance/at";
import _Object$setPrototypeOf from "@core-js/pure/actual/object/set-prototype-of";
import _Reflect from "@core-js/pure/actual/reflect";
var _ref;
// A guard carries the prototype install into its rendered branches. Both an early closure
// query and a later receiver query retain that source fact; query order cannot erase the install.
const owners = {};
export const early = () => _findLastMaybeArray(owners).call(owners, f);
_ref = c ? Object : _Reflect, _ref === Object ? _Object$setPrototypeOf(owners, Array.prototype) : _ref.setPrototypeOf(owners, Array.prototype);
export const late = _at(owners).call(owners, -1);