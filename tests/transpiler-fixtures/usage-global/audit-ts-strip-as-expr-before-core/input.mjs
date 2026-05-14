// plugin order: `@babel/plugin-transform-typescript` listed FIRST, so per-node visitors
// strip TS wrappers (`as`, `<T>...`, `satisfies`) before core-js sees them. core-js then
// observes plain `.at()` / `Array.from()` calls and emits the usual polyfill imports
const xs = ([1, 2, 3] as number[]).at(0);
const ys = Array.from(<Iterable<number>> [4, 5]);
console.log(xs, ys);
