import "<CWD>/packages/core-js/modules/es.object.entries.js";
import "<CWD>/packages/core-js/modules/es.object.to-string.js";
import "<CWD>/packages/core-js/modules/es.array.from.js";
import "<CWD>/packages/core-js/modules/es.global-this.js";
import "<CWD>/packages/core-js/modules/es.string.iterator.js";
import "<CWD>/packages/core-js/modules/web.self.js";
// reads of the stored target claim through the RENDERED conditional in every guard form -
// and, because the render IS the navigation it replaced, in unguarded forms too (a braced
// `if` body, a later function body) exactly like the raw source classifies them
let k13;
k13 = globalThis.window?.self.window;
export let viaBracedIfRead;
if (k13) {
  viaBracedIfRead = k13.Array.from('ab');
}
export function viaFunctionBodyRead() {
  return k13.Object.entries({});
}