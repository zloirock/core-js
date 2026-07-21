// optional chain with a non-optional intermediate hop between the optional inner and outer
// calls: `arr.flat?.().map(...).filter?.()`. the chain combine threads the surviving `.map(...)`
// onto the memoized inner result so the hop is preserved instead of dropped (a dropped hop would
// corrupt the value). the trailing `.some(...)` (native here, not polyfilled) rides the SUCCESS
// branch: a short-circuiting chain skips it natively, so a paren wrap severing it onto the
// ternary result would throw on the void 0 path where native yields undefined
const arr = [1, 2];
arr.flat?.().map(x => x * 2).filter?.().some(x => x > 3);
// a CALL link inside an optional-root receiver keeps the fold: the call is its own dispatch
// whose guard-hoist already covers the nullish root - the single-root hoist is member-walk only
arr?.slice().flat?.().at(0);
