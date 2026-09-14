// a ctor-alias destructured from a zero-arg IIFE returning the global surface
// (`const { Map: M } = (() => globalThis)()`) registers the same `Map` hint as the bare
// `= globalThis` form, so `M` resolves to the pure Map constructor - the wrapper is peeled
// before the alias-pair enumeration classifies the source. The IIFE itself is a call the inline
// canon proves to yield the realm with no effect on the way, so it leaves with the consumed init
// instead of standing as a discarded statement.
const { Map: M } = (() => globalThis)();
new M();
