import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _Object$setPrototypeOf from "@core-js/pure/actual/object/set-prototype-of";
import _Reflect from "@core-js/pure/actual/reflect";
var _ref;
// where pure guards an open selection of the installer's owners, the guard absorbs the install call: a
// receiver typed before that render - a closure written above it - reads the install, one typed after it
// does not, whatever else the file reads. global, rewriting nothing, reads it for both; the installer and
// its owners load their own modules
const owners = {};
export const early = () => _findLastMaybeArray(owners).call(owners, f);
_ref = c ? Object : _Reflect, _ref === Object ? _Object$setPrototypeOf(owners, Array.prototype) : _ref.setPrototypeOf(owners, Array.prototype);
export const late = owners.at(-1);