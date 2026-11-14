import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.push";
import "core-js/modules/es.string.iterator";
// A private static callable supplies the constructor used by its caller.
const effects = [];
let r;
const out = [];
class F {
  static #c() {
    effects.push("callee");
    return Array;
  }
  static run() {
    out.push(F.#c().from((effects.push("arg"), [3])));
  }
}
F.run();
r = out;
export { r, effects };