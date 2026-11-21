import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.function.name";
import "core-js/modules/es.string.at";
import "core-js/modules/es.weak-map.constructor";
import "core-js/modules/es.weak-map.get-or-insert";
import "core-js/modules/es.weak-map.get-or-insert-computed";
import "core-js/modules/web.dom-collections.iterator";
// The arrow changes the actual private slot from an Array to a String.
class Lexical {
  #value = [3];
  write() {
    (() => {
      this.#value = "xyz";
    })();
  }
  first() {
    return this.#value.at(0);
  }
}
// An unbranded receiver rejects the regular function's write. This slot stays an Array.
class Dynamic {
  #value = [4];
  write() {
    (function () {
      this.#value = "other";
    }).call({});
  }
  first() {
    return this.#value.at(0);
  }
}
const local = new Lexical();
const other = new Dynamic();
const before = local.first();
local.write();
let error;
try {
  other.write();
} catch (caught) {
  error = caught.name;
}
export const values = [before, local.first(), other.first(), error];