// trailing COMPUTED member access after a threaded chain: `chainResult[0]`. like the `.X`
// follow-shape, without a paren-wrap the `[0]` would bind to the success branch only
// (`cond ? a : b[0]`), stranding the null path; the wrap targets the conditional result. the
// intermediate `.map(...)` hop is threaded onto the inner result, not dropped
const arr = [1, 2];
arr.flat?.().map(x => x * 2).filter?.()[0];
