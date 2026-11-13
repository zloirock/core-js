import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
// A decided selection carries the throw of the operand it yields.
// Global preserves the source; this row guards the injection surface.
export const {
  from
} = typeof Symbol !== "undefined" ? globalThis.window?.Array : Set;