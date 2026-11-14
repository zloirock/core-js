import "core-js/modules/es.array.at";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.at";
// A later constructor write cannot invalidate an earlier extraction.
const {
  prototype: {
    at
  }
} = Array;
if (flag) globalThis.Array = other;
export { at };