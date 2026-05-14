// Object-outer / Array-inner destructure with leading-spread inside the inner array. The
// `a` property's value `[...spread, 'x']` has the same runtime-uncertainty as the nested-
// array case: position 1 can be a spread element or the trailing 'x'. resolveObjectMemberPath
// composes both the object-key step ('a') and the numeric step (1) through the same numeric
// branch, so the spread-guard must cover this entry point too. Symmetric with the
// nested-array case but reaches the numeric step via property access.
declare const spread: number[];
const { a: [, b] } = { a: [...spread, 'x'] };
const c = 42;
b.at(-1);
c.toFixed(2);
