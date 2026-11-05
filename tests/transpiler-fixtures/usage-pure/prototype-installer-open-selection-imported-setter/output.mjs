import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _at from "@core-js/pure/actual/instance/at";
import _Object$setPrototypeOf from "@core-js/pure/actual/object/set-prototype-of";
import _Reflect from "@core-js/pure/actual/reflect";
import _Reflect$setPrototypeOf from "@core-js/pure/actual/reflect/set-prototype-of";
var _ref;
// A guard over the installer owners preserves the prototype install for later receiver typing.
// Selecting the owners or the setter functions themselves yields the same dispatch family.
const owners = {};
_ref = c ? Object : _Reflect, _ref === Object ? _Object$setPrototypeOf(owners, Array.prototype) : _ref.setPrototypeOf(owners, Array.prototype);
export const a = _at(owners).call(owners, -1);
const setters = {};
(c ? _Object$setPrototypeOf : _Reflect$setPrototypeOf)(setters, Array.prototype);
export const b = _findLastMaybeArray(setters).call(setters, f);