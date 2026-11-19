import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _JSON$stringify from "@core-js/pure/actual/json/stringify";
// `JSON.stringify(o)` is a pure read, so the alias-closure narrow on `o.arr` survives.
// The array-narrow polyfill must be picked, not the generic instance fallback.
const o = {
  arr: [1, 2, 3],
  test() {
    var _ref;
    _JSON$stringify(o);
    return _atMaybeArray(_ref = this.arr).call(_ref, 0);
  }
};
o.test();