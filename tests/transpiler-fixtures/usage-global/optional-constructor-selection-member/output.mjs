import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
// The optional static retains its polyfill through a constructor carrier.
// A continuing instance read must not leave the static native.
export const effects = [];
let held;
let other;
export const r = (globalThis.Array || Array)?.from([1, 2]).at(-1);