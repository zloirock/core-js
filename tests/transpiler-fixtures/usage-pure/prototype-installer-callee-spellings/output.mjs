import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _toReversedMaybeArray from "@core-js/pure/actual/array/instance/to-reversed";
import _withMaybeArray from "@core-js/pure/actual/array/instance/with";
import _Object$freeze from "@core-js/pure/actual/object/freeze";
// a prototype install is seen whichever spelling names the installer - an alias of it, a selection
// this build decides, a constructor alias, a destructured static, a parenthesized or a detached
// callee - so the object dispatches the installed family. a callee that resolves to another static
// installs nothing. distinct method per line
const setProto = Object.setPrototypeOf;
const aliased = {};
setProto(aliased, Array.prototype);
export const a = _atMaybeArray(aliased).call(aliased, -1);
const decided = {};
Object.setPrototypeOf(decided, Array.prototype);
export const b = _findLastMaybeArray(decided).call(decided, f);
const O = Object;
const ctorAlias = {};
O.setPrototypeOf(ctorAlias, Array.prototype);
export const c = _flatMaybeArray(ctorAlias).call(ctorAlias);
const {
  setPrototypeOf
} = Object;
const destructured = {};
setPrototypeOf(destructured, Array.prototype);
export const d = _flatMapMaybeArray(destructured).call(destructured, f);
const parenthesized = {};
Object.setPrototypeOf(parenthesized, Array.prototype);
export const g = _toReversedMaybeArray(parenthesized).call(parenthesized);
const detached = {};
(0, Object.setPrototypeOf)(detached, Array.prototype);
export const h = _withMaybeArray(detached).call(detached, 0, 1);
const freeze = _Object$freeze;
const notInstalled = {};
freeze(notInstalled, Array.prototype);
export const e = notInstalled.toSorted();