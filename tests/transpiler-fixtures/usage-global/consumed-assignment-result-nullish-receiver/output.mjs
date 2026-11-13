import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
// Returning the assignment source must not replace its required nullish coercion.
let of;
export const value = {
  of
} = globalThis.window?.Array;
export { of };