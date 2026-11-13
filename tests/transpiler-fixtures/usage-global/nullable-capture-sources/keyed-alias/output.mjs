import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
// An aliased optional constructor is checked before the computed key.
// Global preserves the source; this row guards the injection surface.
const held = globalThis.window?.Array;
export const {
  [(effect(), "from")]: from
} = held;