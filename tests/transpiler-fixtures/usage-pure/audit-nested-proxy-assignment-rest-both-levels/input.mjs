// rest binding present at BOTH inner and outer levels of a nested destructure. each level's
// rest gathers its own remaining keys; the polyfilled prop must land on `_unused` sentinel
// at the level where rest exists so neither rest binding is dropped. cascade walks chain
// inner-to-outer and stops at the first rest hit (here: inner level)
let from, inner, outer;
({ Array: { from, ...inner }, ...outer } = globalThis);
