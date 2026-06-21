import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// three-way interface merge, each sibling using a different type-parameter name.
// every sibling decl needs its OWN type-arg subst so the renamed slots (T / U / V)
// all resolve to the receiver's argument; without it siblings 2 and 3 carry raw
// renamed params and member calls fall through to the generic polyfill. at(0) on
// the third sibling proves the V slot resolved to the receiver's string[] argument.
interface Foo<T> {
  a: T;
}
interface Foo<U> {
  b: U;
}
interface Foo<V> {
  c: V;
}
declare const f: Foo<string[]>;
_atMaybeArray(_ref = f.c).call(_ref, 0);