import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _at from "@core-js/pure/actual/instance/at";
// arrow functions inherit `this`, so assignments inside them contribute. regular function
// expressions rebind `this` and must be skipped - collectThisFieldAssignmentTypes's traversal
// does exactly that, so the `function () { this.#v = "str"; }` below doesn't widen #v
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