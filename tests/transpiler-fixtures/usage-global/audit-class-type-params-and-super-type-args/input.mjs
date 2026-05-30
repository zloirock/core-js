// class-level type-param constraint and `extends Base<...>` super-type-args carry global
// references the per-member walks never reach; distinct globals per line keep each import mappable
class WithConstraint<T extends Map<number>> {}
class WithSuperArgs extends WeakMap<Set<number>, number> {}
