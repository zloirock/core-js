// A for-of head's static under an effectful key, ahead of a key the mirror's literal reads natively, would
// have that literal read the key before the effect, so the head relocates into the body and the static is
// served there. An unclaimed key and an instance claim are read natively alike, and the slot's target does
// not matter: a computed member and a member rooted in a call relocate like a binding, at every level.
const o = {};
let f;
for ({ w: { [(e(), 'from')]: f, length: o[k] } } of [{ w: Array }]) use(f);
for ({ w: { v: { [(e(), 'of')]: f, length: g().p } } } of [{ w: { v: Array } }]) use(f);
for ([{ w: { [(e(), 'fromAsync')]: f, name: o[k] } }] of [[{ w: Array }]]) use(f);
