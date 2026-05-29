// optional chain with a non-optional intermediate hop between the optional inner and outer
// calls: `arr.flat?.().map(...).filter?.()`. the chain combine threads the surviving `.map(...)`
// onto the memoized inner result so the hop is preserved instead of dropped (a dropped hop would
// corrupt the value). the trailing `.some(...)` (native here, not polyfilled) forces a paren-wrap
// so it binds to the conditional result, not the success branch alone, restoring native semantics
const arr = [1, 2];
arr.flat?.().map(x => x * 2).filter?.().some(x => x > 3);
