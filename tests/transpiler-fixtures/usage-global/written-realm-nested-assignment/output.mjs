import "core-js/modules/es.array.at";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.at";
import "core-js/modules/web.self";
// A consumed assignment reads the written realm and prototype once.
if (flag) globalThis.self = other;
let at;
({
  prototype: {
    at
  }
} = self.Array);
export { at };