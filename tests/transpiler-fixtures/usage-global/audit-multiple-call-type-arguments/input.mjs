// a single call site with multiple explicit type arguments references one global per slot, none of
// which the call's own visitor reads as runtime refs; distinct globals keep each import mappable
make<WeakMap<object, number>, Set<number>>();
