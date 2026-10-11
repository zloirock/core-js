import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _Map from "@core-js/pure/actual/map/constructor";
// a typed initializer's install is read only in a file whose member chains spell an install's key, and
// a destructured installer alone spells none: the constructed instance keeps its initializer's type, an
// accepted boundary of that gate, while a literal's install is read regardless. `Map` loads its own
// modules
const {
  setPrototypeOf
} = Object;
const constructed = new _Map();
setPrototypeOf(constructed, Array.prototype);
export const a = constructed.at(-1);
const literal = {};
setPrototypeOf(literal, Array.prototype);
export const b = _findLastMaybeArray(literal).call(literal, f);