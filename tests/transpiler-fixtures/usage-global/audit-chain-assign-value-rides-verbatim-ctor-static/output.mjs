import "<CWD>/packages/core-js/modules/es.array.at.js";
import "<CWD>/packages/core-js/modules/es.global-this.js";
import "<CWD>/packages/core-js/modules/es.number.max-safe-integer.js";
import "<CWD>/packages/core-js/modules/web.self.js";
// A collapse that keeps a chain assignment re-emits the assignment around a REBUILT value, and what the value's own render copied
// from the source rides along with it.
let q;
const arr = [1];
export const ctorStatic = (q = (arr.at(0), globalThis).self).Number.MAX_SAFE_INTEGER;