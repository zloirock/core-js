import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// A shared conditional-member type graph keeps the same receiver family at every branch.
// Repeated aliases must not change the selected helper or broaden the import set.
type C0<T> = {
  list: number[];
};
type C1<T> = T extends string ? C0<T> : C0<T>;
type C2<T> = T extends string ? C1<T> : C1<T>;
type C3<T> = T extends string ? C2<T> : C2<T>;
type C4<T> = T extends string ? C3<T> : C3<T>;
type C5<T> = T extends string ? C4<T> : C4<T>;
type C6<T> = T extends string ? C5<T> : C5<T>;
export function f<U>(x: C6<U>) {
  var _ref;
  return _atMaybeArray(_ref = x.list).call(_ref, 0);
}