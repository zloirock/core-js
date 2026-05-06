import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// spread `o` into a CallExpression whose callee carries no `mutatesArgument` annotation:
// `Math.max(...o)` (Math.max with no annotation). helper unwraps the SpreadElement parent
// through grandparent to Math.max, sees no mutating slot, returns 'trivial' regardless of
// where o's spread elements would land at runtime. complement to the ObjectExpression
// spread fixture (audit-arg-pass-spread-as-arg-narrows) which exercises the value-source
// container path; this one exercises the call-with-non-mutating-callee path
const o = {
  arr: [1, 2, 3],
  test() {
    var _ref, _ref2;
    Math.max(...o);
    const a = _atMaybeArray(_ref = this.arr).call(_ref, 0);
    const b = _includesMaybeArray(_ref2 = this.arr).call(_ref2, 0);
    return [a, b];
  }
};
o.test();