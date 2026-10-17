// three optional levels in one chain: `arr.flat?.().map(...).filter?.().reduce?.(...)`. the
// combine fires at the outermost polyfilled optional call (`.filter?.()`) and threads the
// `.map(...)` hop onto the inner result, marking the consumed intermediates skipped so no
// duplicate chain emit queues at each one. the trailing `.reduce?.(...)` and `.toString()`
// ride the chain inside the alternate - the short-circuit skips them like native;
// TS-annotated args pass through verbatim
const arr = [1, 2];
arr.flat?.().map(x => x * 2).filter?.().reduce?.((a: number, b: number) => a + b, 0).toString();
