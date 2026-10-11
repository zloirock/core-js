import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _toSortedMaybeArray from "@core-js/pure/actual/array/instance/to-sorted";
import _withMaybeArray from "@core-js/pure/actual/array/instance/with";
import _Reflect from "@core-js/pure/actual/reflect";
import _Reflect$setPrototypeOf from "@core-js/pure/actual/reflect/set-prototype-of";
// a prototype install through a selection the build leaves open - of the installer's owners or of the
// installers themselves, spelled in place or held by a name, an arm included - lands whichever arm runs,
// so the object dispatches the installed family; an arm the build decides counts by the operand it runs,
// and one that installs nothing keeps the object's own family beside it. `Reflect` loads its own modules
const owners = {};
(c ? Object : _Reflect).setPrototypeOf(owners, Array.prototype);
export const a = _atMaybeArray(owners).call(owners, -1);
const O = c ? Object : _Reflect;
const held = {};
O.setPrototypeOf(held, Array.prototype);
export const b = _findLastMaybeArray(held).call(held, f);
const heldArm = {};
(d ? O : Object).setPrototypeOf(heldArm, Array.prototype);
export const k = _includesMaybeArray(heldArm).call(heldArm, 1);
const setters = {};
(c ? Object.setPrototypeOf : _Reflect$setPrototypeOf)(setters, Array.prototype);
export const d = _flatMaybeArray(setters).call(setters);
const setPrototype = c ? Object.setPrototypeOf : _Reflect$setPrototypeOf;
const heldSetters = {};
setPrototype(heldSetters, Array.prototype);
export const h = _withMaybeArray(heldSetters).call(heldSetters, 0, 1);
const decidedArm = {};
(c ? Object : _Reflect).setPrototypeOf(decidedArm, Array.prototype);
export const e = _flatMapMaybeArray(decidedArm).call(decidedArm, f);
const unknownArm = {};
(c ? Object : shim).setPrototypeOf(unknownArm, Array.prototype);
export const g = _toSortedMaybeArray(unknownArm).call(unknownArm);