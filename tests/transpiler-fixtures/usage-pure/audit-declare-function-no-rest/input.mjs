// declare function without RestElement - neutralizeTSDeclareFunctions skips this node;
// identifier visitor treats it as type-only, no spurious Function.name polyfill injected
declare function fn(a: number, b: string): void;
declare const x: Parameters<typeof fn>[1];
x.at(0);
