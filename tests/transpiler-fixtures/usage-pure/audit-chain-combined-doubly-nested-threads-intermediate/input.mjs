// optional chain with a non-optional intermediate hop between the optional inner and outer
// calls: `arr.flat?.().map(...).filter?.()`. the chain combine threads the surviving `.map(...)`
// onto the memoized inner result so the hop is preserved instead of dropped (a dropped hop would
// corrupt the value). the trailing `.some(...)` (native here, not polyfilled) rides the SUCCESS
// branch: a short-circuiting chain skips it natively, so a paren wrap severing it onto the
// ternary result would throw on the void 0 path where native yields undefined
const arr = [1, 2];
arr.flat?.().map(x => x * 2).filter?.().some(x => x > 3);
// an optional link BEHIND a call link: each optional gets its own memo and its own test, so the
// nullish root is tested before the maybe-helper reads it and again after the call link returns.
// the receiver is never folded into a single hoisted guard - a call link is its own dispatch and
// the value it produces can be nullish independently of the root
arr?.slice().flat?.().at(0);
