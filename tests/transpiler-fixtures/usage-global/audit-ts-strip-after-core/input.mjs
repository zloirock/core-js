// reverse plugin order: core-js listed FIRST, `@babel/plugin-transform-typescript`
// AFTER. babel interleaves visitors per node, so core-js sees TS-AST (`as`,
// `<T>...`, `!`) and must peel TS wrappers before scanning APIs
const xs = ([1, 2, 3] as number[]).at(0);
const ys = (Array.from as any)([4, 5]);
const zs = (items!).map((x: number) => x);
declare const items: number[];
console.log(xs, ys, zs);
