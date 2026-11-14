import "core-js/modules/es.array.at";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.at";
import "core-js/modules/web.self";
// Single-read navigation can start at a written realm identifier.
if (flag) globalThis.self = other;
const {
  Array: {
    prototype: {
      at
    }
  }
} = self;
export { at };