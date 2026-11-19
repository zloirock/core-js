import "core-js/modules/es.object.entries";
import "core-js/modules/es.array.at";
import "core-js/modules/es.global-this";
// The optional static retains its polyfill through a constructor carrier.
// A continuing instance read must not leave the static native.
export const effects = [];
let held;
let other;
export const r = (globalThis.Object || Object)?.entries({
  a: 1
}).at(0)[0];