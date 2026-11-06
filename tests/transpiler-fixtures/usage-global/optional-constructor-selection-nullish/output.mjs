import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
// The optional static retains its polyfill through a constructor carrier.
// A continuing instance read must not leave the static native.
export const effects = [];
let held;
let other;
export const r = (globalThis.Array ?? Array)?.of(7).includes(7);