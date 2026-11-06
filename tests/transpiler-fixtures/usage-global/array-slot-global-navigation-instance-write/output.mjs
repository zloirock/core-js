import "core-js/modules/es.array.at";
import "core-js/modules/es.global-this";
// Replacing a constructor slot with an array changes the receiver to an instance.
// The later at call needs only the array variant, never the string variant.
const slot = [globalThis.Array];
slot[0] = [8];
export const value = slot[0].at(0);