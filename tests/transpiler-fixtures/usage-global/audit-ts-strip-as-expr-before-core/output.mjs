import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// plugin order: `@babel/plugin-transform-typescript` listed FIRST, so per-node visitors
// strip TS wrappers (`as`, `<T>...`, `satisfies`) before core-js sees them. core-js then
// observes plain `.at()` / `Array.from()` calls and emits the usual polyfill imports
const xs = [1, 2, 3].at(0);
const ys = Array.from([4, 5]);
console.log(xs, ys);