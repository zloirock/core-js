// a hop key written in brackets names the same slot its dotted spelling does, so a claim under it
// rides the same route: the built-in surface narrows to the constructor's own family, a const-bound
// key resolves like the literal, a literal receiver descends through it, and the array-WRAPPED host
// descends its slot to the same surface. a key that only folds through a SEQUENCE keeps its slot -
// consuming the prop would drop the effect the key evaluates, and the module its claim needs is
// still the one usage-global injects
const eff = t => t;
const { ['Array']: { prototype: { at } } } = globalThis;
const K = 'Array';
const { [K]: { prototype: { includes } } } = globalThis;
const [{ ['Array']: { prototype: { forEach } } }] = [globalThis];
const { ['box']: { map } } = { box: [1] };
const { [(eff(1), 'Array')]: { prototype: { values } } } = globalThis;
const { [(eff(2), 'Array')]: { of } } = globalThis;
use(at, includes, forEach, map, values, of);
