// nested TS `as` and `satisfies` casts on a single expression: both wrappers are
// peeled so the polyfill rewrite recognises the underlying expression.
const x = (arr as string[]).at(0) satisfies string;
const y = (arr as string[]).includes!('test');
