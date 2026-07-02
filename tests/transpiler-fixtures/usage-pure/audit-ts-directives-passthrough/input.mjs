// TS type-checker directives (`@ts-ignore` / `@ts-expect-error` / `@ts-nocheck`) are
// erased at type-check time. the plugin must still polyfill the underlying runtime code;
// the comments themselves pass through to the output with their original positions
// @ts-ignore
const a: number[] = [1, 2, 3];
a.at(-1);

// @ts-expect-error something
const b: string[] = ['x'];
b.at(0);

new Map();
