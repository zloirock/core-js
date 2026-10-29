import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.self";
// The sealed read keeps the throw and the independently served stored value.
let held;
export const value = ((held = globalThis.self).window?.self).Array.from([1]);
export { held };