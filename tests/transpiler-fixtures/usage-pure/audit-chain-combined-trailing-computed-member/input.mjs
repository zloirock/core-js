// trailing COMPUTED member access after a threaded chain: `chainResult[0]`. like the `.X`
// follow-shape, the `[0]` binds into the SUCCESS branch (`cond ? void 0 : b[0]`): the chain
// short-circuit skips it natively, so severing it onto the ternary result would throw on the
// void 0 path. the intermediate `.map(...)` hop is threaded onto the inner result, not dropped
const arr = [1, 2];
arr.flat?.().map(x => x * 2).filter?.()[0];
