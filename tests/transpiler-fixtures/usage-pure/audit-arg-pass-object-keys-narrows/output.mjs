import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// `Object.keys(o)` reads enumerable own keys, no mutation. classifier consults
// known-built-in-return-types.json: Object.keys has no `mutatesArgument` annotation,
// so the call is 'trivial' and the alias closure for `o` survives. property-init
// narrow `arr: [1,2,3]` is preserved on both `.at(0)` (Array narrow polyfill) and
// `.includes(0)` (Array narrow polyfill). without this gate, the call would leak
// the closure and force generic `_at` / `_includes`
const o = {
  arr: [1, 2, 3],
  test() {
    var _ref, _ref2;
    Object.keys(o);
    const a = _atMaybeArray(_ref = this.arr).call(_ref, 0);
    const b = _includesMaybeArray(_ref2 = this.arr).call(_ref2, 0);
    return [a, b];
  }
};
o.test();