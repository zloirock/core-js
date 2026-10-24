// optional chain with a non-optional intermediate hop between the optional inner and outer
// calls: `arr.flat?.().map(...).filter?.()`. the chain combine threads the surviving `.map(...)`
// onto the memoized inner result so the hop is preserved instead of dropped (a dropped hop would
// corrupt the value). the trailing `.some(...)` (native here, not polyfilled) rides the SUCCESS
// branch: a short-circuiting chain skips it natively, so a paren wrap severing it onto the
// ternary result would throw on the void 0 path where native yields undefined
const arr = [1, 2];
arr.flat?.().map(x => x * 2).filter?.().some(x => x > 3);
// an optional link BEHIND a call link: the root's live `?.` is the link the guard tests before the
// maybe-helper reads the receiver, and the call link past it is read plainly - the value it
// produces is no test of its own, so a nullish one throws at the helper's read, as native does
arr?.slice().flat?.().at(0);
