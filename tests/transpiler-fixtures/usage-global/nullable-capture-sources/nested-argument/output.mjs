import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.self";
// A nested parameter receives the original nullish value before rejecting it.
// Global preserves the source; this row guards the injection surface.
const held = globalThis.window?.self;
export const result = (({
  Array: {
    from
  }
}) => from)(held);