// `const [{ x }] = items` where `items: { x: T }[]` - the same nested-pattern descent
// applies to annotation-on-init path (not just for-of). Element index 0 against the array
// element type yields `{ x: T }`, then property lookup for `x`. Distinct .at / .toFixed
// per typed slot keeps the init-path narrowing observable independent of the for-of path.
declare const rows: { name: string; age: number }[];
const [{ name, age }] = rows;
name.at(0);
age.toFixed(2);
