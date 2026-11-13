import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
// Keep the source guard and distinguish realm values from user properties.
const g = globalThis;
const sel = flag ? g : globalThis;
export const r = sel.window?.Array.from([3]);