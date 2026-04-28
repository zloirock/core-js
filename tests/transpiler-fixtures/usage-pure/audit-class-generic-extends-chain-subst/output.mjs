import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref, _ref2;
// chained class generics: `A<T> extends B<T>; B<U> extends C<U[]>; C<V>.firstC(): V[]`.
// `const x: A<string>` propagates: A's T -> string, super B<T> -> B<string>, B's U ->
// string, super C<U[]> -> C<string[]>, C's V -> string[]. firstC's return V[] resolves
// to (string[])[] = string[][]. The resolver chains `buildParentClassSubst` at each
// `extends` step so .at(0).flat() picks the array-specific polyfill twice
class C<V> {
  firstC(): V[] {
    return [];
  }
}
class B<U> extends C<U[]> {}
class A<T> extends B<T> {}
declare const x: A<string>;
_flatMaybeArray(_ref = _atMaybeArray(_ref2 = x.firstC()).call(_ref2, 0)).call(_ref);