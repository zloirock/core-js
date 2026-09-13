// A fresh replacement removes the old realm candidate in either flavor.
// This also holds for bindings reached through object, array and class literals.
// Writes to unrelated keys leave the original global claims intact.
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
