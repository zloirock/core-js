// A realm selection in an array wrapper collapses to the one realm it names before any route reads
// it: the claims beside an effectful key then take the receiver mirror, as the plain realm does -
// no array capture reads the constructor off the bare realm slot.
const [{ Array: { [(log.push('k'), 'of')]: a, from: b } }] = [globalThis.window ?? globalThis];
const [{ Array: { [(log.push('k'), 'of')]: c = 1, from: d } }] = [globalThis.window ? globalThis.window : globalThis];
use(a, b, c, d);
