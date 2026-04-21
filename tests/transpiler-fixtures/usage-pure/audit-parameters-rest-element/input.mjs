// `Parameters<typeof fn>[N]` where fn has rest param `...rest: string[]`.
// ambient `declare function` form - before fix, estree-toolkit's scope crawler
// didn't recognise TSDeclareFunction as a scope owner and hit the RestElement
// reference handler which throws `This should be handled by findVisiblePathsInPattern`.
// fix: pre-parse pass retypes TSDeclareFunction to FunctionDeclaration with empty body
declare function fn(a: number, b: boolean, ...rest: string[]): void;
declare const x: Parameters<typeof fn>[2];
x.at(0);
x.includes('foo');
