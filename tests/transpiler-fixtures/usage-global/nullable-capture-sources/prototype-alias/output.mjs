import "core-js/modules/es.array.includes";
import "core-js/modules/es.global-this";
// A constructor name behind an alias does not prove its prototype read safe.
// Global preserves the source; this row guards the injection surface.
const held = globalThis.window?.Array;
export const {
  [(effect(), "includes")]: includes
} = held.prototype;