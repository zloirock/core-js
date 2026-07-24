// a ctor-alias destructured from a zero-arg IIFE returning the global surface
// (`const { Map: M } = (() => globalThis)()`) registers the same `Map` hint as the bare
// `= globalThis` form, so `M` resolves to the pure Map constructor - the wrapper is peeled
// before the alias-pair enumeration classifies the source
const { Map: M } = (() => globalThis)();
new M();
