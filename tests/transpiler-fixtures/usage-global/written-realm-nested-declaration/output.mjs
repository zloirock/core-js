import "core-js/modules/es.array.at";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.at";
import "core-js/modules/web.self";
// A written realm root remains the receiver of its one nested read.
if (flag) globalThis.self = other;
const {
  prototype: {
    at
  }
} = self.Array;
export { at };