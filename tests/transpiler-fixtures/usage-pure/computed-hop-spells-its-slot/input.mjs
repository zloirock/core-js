// a hop key written in brackets names the same slot its dotted spelling does, so a claim under it
// rides the same route: the built-in surface narrows to the constructor's own family, a const-bound
// key resolves like the literal, a literal receiver descends through it, and the array-WRAPPED host
// descends its slot to the same surface. a key that only folds through a SEQUENCE keeps its level
// the way a rest sibling does - the hop retires to a sentinel that runs the key once - and the
// claims below extract off the slot the folded key names
const eff = t => t;
const { ['Array']: { prototype: { at } } } = globalThis;
const K = 'Array';
const { [K]: { prototype: { includes } } } = globalThis;
const [{ ['Array']: { prototype: { forEach } } }] = [globalThis];
const { ['box']: { map } } = { box: [1] };
const { [(eff(1), 'Array')]: { prototype: { values } } } = globalThis;
const { [(eff(2), 'Array')]: { of } } = globalThis;
use(at, includes, forEach, map, values, of);
