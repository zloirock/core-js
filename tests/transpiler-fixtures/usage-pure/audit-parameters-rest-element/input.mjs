// `Parameters<typeof fn>[N]` where `fn` has rest param `...rest: string[]`, declared in
// ambient `declare function` form. TSDeclareFunction must be treated as a scope owner so
// the RestElement resolves cleanly; `x` infers to `string` and gets the string polyfills
declare function fn(a: number, b: boolean, ...rest: string[]): void;
declare const x: Parameters<typeof fn>[2];
x.at(0);
x.includes('foo');
