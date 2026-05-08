import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
var _ref, _ref2;
// chain of generic classes with extends-substitution: `A<T> extends B<T>`,
// `B<U> extends C<U[]>`, `C<V>.firstC(): V[]`. for `const x: A<string>`, type parameters
// must propagate through the whole chain so `firstC()` resolves to `string[][]` and both
// `.at(0)` and `.flat()` pick the array-specific polyfills
class C<V> {
  firstC(): V[] {
    return [];
  }
}
class B<U> extends C<U[]> {}
class A<T> extends B<T> {}
declare const x: A<string>;
_flatMaybeArray(_ref = _atMaybeArray(_ref2 = x.firstC()).call(_ref2, 0)).call(_ref);