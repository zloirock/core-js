import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _Object$setPrototypeOf from "@core-js/pure/actual/object/set-prototype-of";
import _Reflect from "@core-js/pure/actual/reflect";
import _Reflect$setPrototypeOf from "@core-js/pure/actual/reflect/set-prototype-of";
var _ref;
// where a target lacks the installer, pure swaps it in by a guard over the open selection of its
// owners, and that guard absorbs the call before a later receiver is typed: the install there is read
// in neither emitter, an accepted boundary - global, rewriting nothing, reads it. a selection of the
// installers themselves only swaps its arms and stays read. the reads load their own modules
const owners = {};
_ref = c ? Object : _Reflect, _ref === Object ? _Object$setPrototypeOf(owners, Array.prototype) : _ref.setPrototypeOf(owners, Array.prototype);
export const a = owners.at(-1);
const setters = {};
(c ? _Object$setPrototypeOf : _Reflect$setPrototypeOf)(setters, Array.prototype);
export const b = _findLastMaybeArray(setters).call(setters, f);