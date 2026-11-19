// a capture moves a keyed static's binding into a declarator of its own, and a later sibling reads it
// once that claim registered the static: the call's array result narrows its dispatch - in the same
// declaration and after an exported one - as after a plain statement
function l(t, v) { return v; }
function make() { return { w: Array, v: Array, other: 1 }; }
const { w: { [l('k', 'from')]: from }, other } = make(), last = from([1, 2]).at(-1);
export const { v: { [l('k2', 'of')]: of }, other: rest } = make();
export const has = of(1, 2).includes(2);
export { other, last };
