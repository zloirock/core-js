import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// A shared conditional-awaited type graph keeps the same receiver family at every branch.
// Repeated aliases must not change the selected helper or broaden the import set.
type C0<T> = number[];
type C1<T> = T extends string ? C0<T> : C0<T>;
type C2<T> = T extends string ? C1<T> : C1<T>;
type C3<T> = T extends string ? C2<T> : C2<T>;
type C4<T> = T extends string ? C3<T> : C3<T>;
type C5<T> = T extends string ? C4<T> : C4<T>;
type C6<T> = T extends string ? C5<T> : C5<T>;
// @ts-expect-error generic Awaited remains deferred until instantiation
export function f<U>(x: Awaited<C6<U>>) {
  return _atMaybeArray(x).call(x, 0);
}