import "<CWD>/packages/core-js/modules/es.object.to-string.js";
import "<CWD>/packages/core-js/modules/es.array.iterator.js";
import "<CWD>/packages/core-js/modules/es.string.repeat.js";
import "<CWD>/packages/core-js/modules/es.global-this.js";
import "<CWD>/packages/core-js/modules/es.map.constructor.js";
import "<CWD>/packages/core-js/modules/es.map.species.js";
import "<CWD>/packages/core-js/modules/es.map.get-or-insert.js";
import "<CWD>/packages/core-js/modules/es.map.get-or-insert-computed.js";
import "<CWD>/packages/core-js/modules/es.number.max-safe-integer.js";
import "<CWD>/packages/core-js/modules/es.number.to-fixed.js";
import "<CWD>/packages/core-js/modules/es.string.iterator.js";
import "<CWD>/packages/core-js/modules/web.dom-collections.iterator.js";
import "<CWD>/packages/core-js/modules/web.self.js";
// a collapse that discards the hops below its leaf discards their computed keys too, so the
// effects buried in them re-emit with the leaf's own, in native order (root side first). the
// sequence-tail rebind cuts the same way. the last row has no hop key - it pins the plain shape
let u;
let g = 0;
let e = 0;
let c = 0;
export const belowLeaf = (u = globalThis.window)?.[g++, 'Number'].MAX_SAFE_INTEGER.toFixed(2);
export const atLeaf = (u = globalThis.window)?.Number[g++, 'MAX_SAFE_INTEGER'].toFixed(2);
export const seTailHopKey = (e++, globalThis)[c++, 'self'].Map;
export const seTailPlain = (e++, globalThis).Map;