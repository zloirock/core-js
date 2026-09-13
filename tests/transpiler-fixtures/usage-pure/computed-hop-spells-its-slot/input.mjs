// A bracketed hop key selects the same slot as its dotted spelling, including constant aliases
// and literal or array-wrapped receivers. An effectful key runs once before the selected slot
// is read by an instance leaf, while the leaf keeps the correct constructor-family narrowing.
const eff = t => t;
const { ['Array']: { prototype: { at } } } = globalThis;
const K = 'Array';
const { [K]: { prototype: { includes } } } = globalThis;
const [{ ['Array']: { prototype: { forEach } } }] = [globalThis];
const { ['box']: { map } } = { box: [1] };
const { [(eff(1), 'Array')]: { prototype: { values } } } = globalThis;
const { [(eff(2), 'Array')]: { of } } = globalThis;
use(at, includes, forEach, map, values, of);
