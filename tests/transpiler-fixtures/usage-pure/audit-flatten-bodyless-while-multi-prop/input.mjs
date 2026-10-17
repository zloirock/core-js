// loop body slot variant: same flatten pattern as if-bodyless, but the unconditional-
// hoist failure mode is more severe because the gated polyfill is meant to re-evaluate
// every iteration; without wrapping, second binding lives outside the loop body
let probe = 0;
while (probe++ < 1) var { Array: { from }, Object: { fromEntries } } = globalThis;
