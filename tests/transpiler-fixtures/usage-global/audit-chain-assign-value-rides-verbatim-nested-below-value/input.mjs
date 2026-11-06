// A collapse that keeps a chain assignment re-emits the assignment around a REBUILT value, and what the value's own render copied
// from the source rides along with it.
let q;
// an unresolvable hop BELOW the collapse point keeps its guard - the value the source computes can
// be undefined, and an unguarded leaf would report the global where native short-circuits or throws.
// the sequence prefix rides INSIDE the test with its own polyfills alive, an alias root keeps its name
export const nestedBelowValue = (q = globalThis.window.self).Map.name;
