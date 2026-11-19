import "core-js/modules/es.object.keys";
import "core-js/modules/es.array.at";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.at";
// A static call before the global write retains its array result.
export const result = Object.keys(input).at(-1);
if (flag) globalThis.Object = other;