// a flatten slot whose extractions already render the declarator's init - a routed receiver memo,
// a rendered sibling, an SE-key pair the slot took over - must not have that init's sequence
// prefix lifted a second time, and a slot mutated after the fact keeps the entries the other
// channels routed into it: rebuilding the record from scratch dropped a sibling's polyfill
let k = 0;
let k4 = 0;
function log() {}
function eff() {}
function getArr() { return [1]; }
const { Array: { from } } = globalThis, { at, concat } = (log(), getArr());
const { Array: { of } } = globalThis, { indexOf, [(k++, 'flat')]: fl } = getArr();
var { Object: { entries: f4 } } = globalThis, { [(k4++, 'of')]: of4, other4 } = (eff(), Array);
export { from, at, concat, of, indexOf, fl, f4, of4, other4 };
