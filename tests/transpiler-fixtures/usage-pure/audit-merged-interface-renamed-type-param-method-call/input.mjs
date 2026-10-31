// class+interface merging with renamed type-param, METHOD CALL form - a different resolution
// path from the property-access variant in audit-merged-interface-renamed-type-param. the
// interface method's return uses the renamed `U`; without a per-interface subst remap,
// `box.fetch()` falls to generic dispatch instead of the array polyfill
// @ts-expect-error merged declarations tsc refuses are the shape under test
class Box<T> {
  base(): T { return null!; }
}
// @ts-expect-error merged declarations tsc refuses are the shape under test
interface Box<U> {
  fetch(): U[];
}
// @ts-expect-error a generic named without its type arguments is the shape under test
declare const box: Box<string>;
box.fetch().at(0);
