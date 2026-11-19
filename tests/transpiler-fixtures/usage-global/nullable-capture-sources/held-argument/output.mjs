import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
// An alias retains the optional source guard when supplying a flat parameter.
// Global preserves the source; this row guards the injection surface.
const held = globalThis.window?.Array;
export const result = (({
  from
}) => from)(held);