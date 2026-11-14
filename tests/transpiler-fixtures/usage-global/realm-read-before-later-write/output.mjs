import "core-js/modules/es.array.at";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.at";
import "core-js/modules/web.self";
// A later realm write cannot change the type of this earlier read.
const {
  prototype: {
    at
  }
} = self.Array;
if (flag) globalThis.self = other;
export { at };