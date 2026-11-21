import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _at from "@core-js/pure/actual/instance/at";
// The arrow changes the actual private slot from an Array to a String.
class Lexical {
  #value = [3];
  write() {
    (() => {
      this.#value = "xyz";
    })();
  }
  first() {
    var _ref;
    return _at(_ref = this.#value).call(_ref, 0);
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
    var _ref2;
    return _atMaybeArray(_ref2 = this.#value).call(_ref2, 0);
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
  error = _nameMaybeFunction(caught);
}
export const values = [before, local.first(), other.first(), error];