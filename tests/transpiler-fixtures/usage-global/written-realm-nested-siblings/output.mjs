import "core-js/modules/es.array.at";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.at";
import "core-js/modules/web.self";
// A surviving sibling must retain its order and share the captured receiver.
if (flag) globalThis.self = other;
const {
  prototype: {
    at
  },
  extra
} = self.Array;
export { at, extra };