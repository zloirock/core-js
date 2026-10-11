import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.namespace";
import "core-js/modules/es.reflect.set-prototype-of";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.find-last";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.flat-map";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.to-reversed";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.array.unscopables.flat-map";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.flat-map";
import "core-js/modules/es.string.at";
import "core-js/modules/web.dom-collections.iterator";
// a prototype install through a selection the build leaves open one arm of which is no setter lands where
// a setter arm runs - owners or setters, held by a name or not, a `Reflect` arm, an `&&`, a function that
// writes `__proto__` - so the object dispatches the installed family beside its own; an arm the build never
// takes installs nothing, nested or not. the `Reflect` reads load its own modules; distinct method per line
const O = c ? Object : shim;
const heldOwners = {};
O.setPrototypeOf(heldOwners, Array.prototype);
export const a = heldOwners.at(-1);
const setters = {};
(c ? Object.setPrototypeOf : fn)(setters, Array.prototype);
export const b = setters.findLast(f);
const setPrototype = c ? Reflect.setPrototypeOf : fn;
const heldSetters = {};
setPrototype(heldSetters, Array.prototype);
export const d = heldSetters.flat();
const logical = {};
(c && Reflect).setPrototypeOf(logical, Array.prototype);
export const e = logical.flatMap(f);
const written = {};
(c ? (target, proto) => {
  target.__proto__ = proto;
} : Object.setPrototypeOf)(written, Array.prototype);
export const g = written.toReversed();
const dead = {};
(typeof Symbol == 'undefined' ? Object : shim).setPrototypeOf(dead, Array.prototype);
export const h = dead.with(0, 1);
const deadNested = {};
(c ? shim : typeof Symbol == 'undefined' ? Reflect : other).setPrototypeOf(deadNested, Array.prototype);
export const k = deadNested.toSorted();