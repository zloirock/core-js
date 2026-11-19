import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
// An alias of a decided selection carries its optional value into later reads.
// Global preserves the source; this row guards the injection surface.
const held = typeof Symbol !== "undefined" ? globalThis.window?.Array : Set;
export const {
  from
} = held;