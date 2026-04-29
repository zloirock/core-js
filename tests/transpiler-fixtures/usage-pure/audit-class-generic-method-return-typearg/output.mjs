import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// `class C<V> { firstC(): V }` instantiated via `const x: C<string[]>` - the method's
// return-type references the class type-param `V`. The receiver's type-args must be
// threaded through class-member return-type resolution so V resolves to `string[]`,
// otherwise downstream `.at(0)` falls back to the generic instance polyfill instead
// of the array-specific one
class C<V> {
  firstC(): V {
    return undefined as any;
  }
}
declare const x: C<string[]>;
_atMaybeArray(_ref = x.firstC()).call(_ref, 0);