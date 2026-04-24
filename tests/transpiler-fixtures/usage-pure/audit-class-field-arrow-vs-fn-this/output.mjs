import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _at from "@core-js/pure/actual/instance/at";
// arrow functions inherit `this` from the enclosing class method, so `this.#v = xs`
// inside the `.then(xs => ...)` arrow widens `#v` to Array. a regular function
// expression (`function () { this.#v = "str" }`) rebinds `this` to its call-site
// receiver, so it must NOT contribute `"str"` to `#v`'s inferred type
class C {
  #v = null;
  load() {
    _Promise$resolve([1, 2]).then(xs => {
      this.#v = xs;
    });
  }
  distract() {
    (function () {
      this.#v = "str";
    }).call({});
  }
  first() {
    var _ref;
    return null == (_ref = this.#v) ? void 0 : _at(_ref).call(_ref, 0);
  }
}