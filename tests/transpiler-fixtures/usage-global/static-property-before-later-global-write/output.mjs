import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.global-this";
import "core-js/modules/es.number.max-safe-integer";
import "core-js/modules/es.regexp.to-string";
import "core-js/modules/es.string.at";
// A static value before the global write retains its primitive type.
export const result = Number.MAX_SAFE_INTEGER.toString().at(-1);
if (flag) globalThis.Number = other;