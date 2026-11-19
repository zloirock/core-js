import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.find-last";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a typed initializer's install is read only in a file whose member chains spell an install's key, and
// a destructured installer alone spells none: the constructed instance keeps its initializer's type, an
// accepted boundary of that gate, while a literal's install is read regardless. `Map` loads its own
// modules
const {
  setPrototypeOf
} = Object;
const constructed = new Map();
setPrototypeOf(constructed, Array.prototype);
export const a = constructed.at(-1);
const literal = {};
setPrototypeOf(literal, Array.prototype);
export const b = literal.findLast(f);