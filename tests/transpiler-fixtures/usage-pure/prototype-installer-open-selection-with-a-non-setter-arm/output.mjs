import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _toReversedMaybeArray from "@core-js/pure/actual/array/instance/to-reversed";
import _at from "@core-js/pure/actual/instance/at";
import _Reflect from "@core-js/pure/actual/reflect";
import _Reflect$setPrototypeOf from "@core-js/pure/actual/reflect/set-prototype-of";
// a prototype install through a selection the build leaves open one arm of which is no setter lands where
// a setter arm runs - owners or setters, held by a name or not, a `Reflect` arm, an `&&`, a function that
// writes `__proto__` - so the object dispatches the installed family beside its own; an arm the build never
// takes installs nothing, nested or not. the `Reflect` reads load its own modules; distinct method per line
const O = c ? Object : shim;
const heldOwners = {};
O.setPrototypeOf(heldOwners, Array.prototype);
export const a = _at(heldOwners).call(heldOwners, -1);
const setters = {};
(c ? Object.setPrototypeOf : fn)(setters, Array.prototype);
export const b = _findLastMaybeArray(setters).call(setters, f);
const setPrototype = c ? _Reflect$setPrototypeOf : fn;
const heldSetters = {};
setPrototype(heldSetters, Array.prototype);
export const d = _flatMaybeArray(heldSetters).call(heldSetters);
const logical = {};
(c && _Reflect).setPrototypeOf(logical, Array.prototype);
export const e = _flatMapMaybeArray(logical).call(logical, f);
const written = {};
(c ? (target, proto) => {
  target.__proto__ = proto;
} : Object.setPrototypeOf)(written, Array.prototype);
export const g = _toReversedMaybeArray(written).call(written);
const dead = {};
shim.setPrototypeOf(dead, Array.prototype);
export const h = dead.with(0, 1);
const deadNested = {};
(c ? shim : other).setPrototypeOf(deadNested, Array.prototype);
export const k = deadNested.toSorted();