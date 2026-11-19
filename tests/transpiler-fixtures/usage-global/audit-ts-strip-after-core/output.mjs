import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.map";
import "core-js/modules/es.array.species";
import "core-js/modules/es.string.iterator";
// reverse plugin order: core-js listed FIRST, `@babel/plugin-transform-typescript`
// AFTER. babel interleaves visitors per node, so core-js sees TS-AST (`as`,
// `<T>...`, `!`) and must peel TS wrappers before scanning APIs
const xs = [1, 2, 3].at(0);
const ys = Array.from([4, 5]);
const zs = items.map(x => x);
console.log(xs, ys, zs);