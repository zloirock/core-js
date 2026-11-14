import "core-js/modules/es.array.at";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.at";
import "core-js/modules/web.self";
// A pending extraction carries the prefix and the rewritten source slot once.
if (flag) globalThis.self = other;
let at;
({
  prototype: {
    at
  }
} = (effect(), globalThis.self.Array));
export { at };