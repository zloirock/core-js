// a capture moves a keyed static's binding into a declarator of its own with the writes the source
// recorded: a binding written later is not the static any more, so a call off it dispatches generically
function l(t, v) { return v; }
function make() { return { w: Array, other: 1 }; }
let { w: { [l('k', 'from')]: from }, other } = make();
from = x => 'str';
export const last = from([1, 2]).at(-1);
let { w: { [l('k2', 'of')]: of }, other: rest } = make(), reset = (of = x => 'str'), first = of(1, 2).includes('s');
export { other, rest, reset, first };
