import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// `{...o}` puts `o` inside a SpreadElement that the ObjectExpression consumes by
// enumerating own enumerable properties of `o`. `o` is read, not passed as a target slot;
// the resulting object is a SHALLOW COPY of o's own props, never an alias. classifier sees
// SpreadElement parent and returns 'trivial' directly - same applies to `[...o]` / `f(...o)`
// / `new C(...o)` (iteration sites). without this rule, every spread site would leak the
// closure even though the spread is purely a read
const o = {
  arr: [1, 2, 3],
  test() {
    var _ref, _ref2;
    const copy = {
      ...o
    };
    const a = _atMaybeArray(_ref = this.arr).call(_ref, 0);
    const b = _includesMaybeArray(_ref2 = this.arr).call(_ref2, 0);
    return [a, b, copy];
  }
};
o.test();