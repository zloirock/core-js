// a capture moving a `var` or `let` keyed static's binding into a declarator of its own keeps it the
// binding the source declared, not a second write of it: a call off it narrows as off a `const`
function l(t, v) { return v; }
function make() { return { w: Array, v: Array, other: 1 }; }
var { v: { [l('k', 'of')]: of }, other } = make();
export const has = of(1, 2).includes(2);
let { w: { [l('k2', 'from')]: from }, other: rest } = make();
export const last = from([1, 2]).at(-1);
export { other, rest };
