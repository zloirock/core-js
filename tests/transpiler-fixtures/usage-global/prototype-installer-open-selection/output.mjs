import "core-js/modules/es.reflect.namespace";
import "core-js/modules/es.reflect.set-prototype-of";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.find-last";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.flat-map";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.sort";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.to-sorted";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.array.unscopables.flat-map";
import "core-js/modules/es.array.with";
// a prototype install through a selection the build leaves open - of the installer's owners or of the
// installers themselves, spelled in place or held by a name, an arm included - lands whichever arm runs,
// so the object dispatches the installed family; an arm the build decides counts by the operand it runs,
// and one that installs nothing keeps the object's own family beside it. `Reflect` loads its own modules
const owners = {};
(c ? Object : Reflect).setPrototypeOf(owners, Array.prototype);
export const a = owners.at(-1);
const O = c ? Object : Reflect;
const held = {};
O.setPrototypeOf(held, Array.prototype);
export const b = held.findLast(f);
const heldArm = {};
(d ? O : Object).setPrototypeOf(heldArm, Array.prototype);
export const k = heldArm.includes(1);
const setters = {};
(c ? Object.setPrototypeOf : Reflect.setPrototypeOf)(setters, Array.prototype);
export const d = setters.flat();
const setPrototype = c ? Object.setPrototypeOf : Reflect.setPrototypeOf;
const heldSetters = {};
setPrototype(heldSetters, Array.prototype);
export const h = heldSetters.with(0, 1);
const decidedArm = {};
(c ? Object : typeof Reflect != 'undefined' ? Reflect : shim).setPrototypeOf(decidedArm, Array.prototype);
export const e = decidedArm.flatMap(f);
const unknownArm = {};
(c ? Object : shim).setPrototypeOf(unknownArm, Array.prototype);
export const g = unknownArm.toSorted();