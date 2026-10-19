// a class type-parameter default and multiple type-parameter constraints carry global
// references the per-member walks never reach; distinct globals per line keep each import mappable
// @ts-expect-error a generic named without its type arguments is the shape under test
class WithDefault<T = Map<number>> {}
class WithConstraints<A extends Set<number>, B extends WeakMap<object, number>> {}
