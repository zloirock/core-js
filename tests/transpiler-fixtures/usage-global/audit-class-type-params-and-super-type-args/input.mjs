// class-level type-param constraint and `extends Base<...>` super-type-args carry global
// references the per-member walks never reach; distinct globals per line keep each import mappable
// @ts-expect-error a generic named without its type arguments is the shape under test
class WithConstraint<T extends Map<number>> {}
class WithSuperArgs extends WeakMap<Set<number>, number> {}
