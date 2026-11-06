// `Parameters<typeof fn>[N]` indexing into a rest-param position of a `declare function`:
// the rest element type `string[]` flows through, so `x` narrows to `string` and the
// `at` / `includes` instance calls pick the string-specific polyfill variant.
declare function fn(a: number, b: boolean, ...rest: string[]): void;
declare const x: Parameters<typeof fn>[2];
x.at(0);
x.includes('foo');
