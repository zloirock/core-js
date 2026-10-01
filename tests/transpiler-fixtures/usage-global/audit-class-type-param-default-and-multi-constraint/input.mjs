// a class type-parameter default and multiple type-parameter constraints carry global
// references the per-member walks never reach; distinct globals per line keep each import mappable
class WithDefault<T = Map<number>> {}
class WithConstraints<A extends Set<number>, B extends WeakMap<object, number>> {}
