import "core-js/modules/es.array.at";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.at";
// An earlier Object.create result is not an array or string.
export const result = Object.create(null).at;
if (flag) globalThis.Object = other;