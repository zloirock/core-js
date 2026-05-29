// two consecutive non-optional polyfillable hops (`.map(...).slice(...)`) between the optional
// inner and outer. each threads onto the running result, innermost first, while `_ref` slots are
// allocated outermost-first so the emit matches across both plugins even with more than one hop
const arr = [1, 2];
arr.flat?.().map(x => x * 2).slice(1).filter?.(y => y > 4);
