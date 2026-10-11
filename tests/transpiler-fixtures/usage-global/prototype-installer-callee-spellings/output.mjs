import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.freeze";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.find-last";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.flat-map";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.to-reversed";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.array.unscopables.flat-map";
import "core-js/modules/es.array.with";
// a prototype install is seen whichever spelling names the installer - an alias of it, a selection
// this build decides, a constructor alias, a destructured static, a parenthesized or a detached
// callee - so the object dispatches the installed family. a callee that resolves to another static
// installs nothing. distinct method per line
const setProto = Object.setPrototypeOf;
const aliased = {};
setProto(aliased, Array.prototype);
export const a = aliased.at(-1);
const decided = {};
(typeof Symbol != 'undefined' ? Object : Reflect).setPrototypeOf(decided, Array.prototype);
export const b = decided.findLast(f);
const O = Object;
const ctorAlias = {};
O.setPrototypeOf(ctorAlias, Array.prototype);
export const c = ctorAlias.flat();
const {
  setPrototypeOf
} = Object;
const destructured = {};
setPrototypeOf(destructured, Array.prototype);
export const d = destructured.flatMap(f);
const parenthesized = {};
Object.setPrototypeOf(parenthesized, Array.prototype);
export const g = parenthesized.toReversed();
const detached = {};
(0, Object.setPrototypeOf)(detached, Array.prototype);
export const h = detached.with(0, 1);
const freeze = Object.freeze;
const notInstalled = {};
freeze(notInstalled, Array.prototype);
export const e = notInstalled.toSorted();