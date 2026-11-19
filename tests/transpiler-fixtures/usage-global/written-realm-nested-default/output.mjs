import "core-js/modules/es.array.at";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.at";
import "core-js/modules/web.self";
// A nested default keeps its fallback and reads the written realm once.
if (flag) globalThis.self = other;
const {
  prototype: {
    at = fallback
  }
} = self.Array;
export { at };