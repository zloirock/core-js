// the written-slot boundary for a nav rooted at a container LITERAL. such a binding holds a
// container exactly as a bare literal does, so the census indexes it through the SAME literal and a
// slot the source REPLACES stops the read - object, array and class-expression roots alike. the
// consult is method-aware like every other one: pure leaves the read native, global over-injects.
// the positives pin the other side - the keys the literal spells ABOVE the name are not the name's
// slots, and an unrelated slot on the same container leaves the read resolving
const obj = ({ h: { g: globalThis } }).h;
obj.g = { Map: null };
hand(obj.g.Map);
const box = ([{ g: globalThis }])[0];
box.g = { Set: null };
hand(box.g.Set);
const statics = (class { static h = { g: globalThis }; }).h;
statics.g = { WeakMap: null };
hand(statics.g.WeakMap);
// `kept.h` is the literal's own key, above the name - the read never goes through it
const kept = ({ h: { g: globalThis } }).h;
kept.h = elsewhere;
hand(kept.g.WeakSet);
// an unrelated slot on the very container the read descends
const aside = ({ h: { g: globalThis } }).h;
aside.tag = 1;
hand(aside.g.Promise);
