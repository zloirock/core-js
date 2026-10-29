import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.self";
// A stored surface contributes one environment probe to both optional reads.
let held;
let effects = 0;
export const value = (held = (effects++, globalThis.self)).window?.Array?.from?.((effects++, [1]));
export { held, effects };