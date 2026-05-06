import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// `Object.freeze(o)` flips [[Extensible]] and locks property writes but does not change any
// existing property's VALUE. our type tracking models property types, not write capability,
// so freeze is treated as non-mutating: no `mutatesArgument` annotation. classifier returns
// 'trivial', narrowing on `arr` is preserved. same applies to `Object.seal` and
// `Object.preventExtensions` (and their Reflect counterparts) - they restrict future
// mutations but don't invalidate the type of properties already in place
const o = {
  arr: [1, 2, 3],
  test() {
    var _ref, _ref2;
    Object.freeze(o);
    const a = _atMaybeArray(_ref = this.arr).call(_ref, 0);
    const b = _includesMaybeArray(_ref2 = this.arr).call(_ref2, 0);
    return [a, b];
  }
};
o.test();