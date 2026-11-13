import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
// A bodyless loop capture rejects absence before evaluating its key.
// Global preserves the source; this row guards the injection surface.
const held = globalThis.window?.Array;
let of;
for (; {
  [(effect(), "of")]: of
} = held, false;);