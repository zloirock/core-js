// Navigation through a literal resolves the same container as navigation through a name.
// Object, array and class roots retain their global claims and sequence effects.
// A fresh replacement removes the old realm candidate; its URL stays null.
const obj = ({ h: { g: globalThis } }).h;
hand(obj.g.Map);
const box = ([{ g: globalThis }])[0];
hand(box.g.Set);
const deep = ({ a: { b: { g: globalThis } } }).a.b;
hand(deep.g.WeakMap);
const statics = (class { static h = { g: globalThis }; }).h;
hand(statics.g.WeakSet);
const seq = (0, { h: { g: globalThis } }).h;
hand(new seq.g.Promise(executor));
// no binding at all between the literal and the read
hand(({ h: { g: globalThis } }).h.g.Reflect);
// the replaced slot: the literal no longer says what `rep.g` holds
const rep = ({ h: { g: globalThis } }).h;
rep.g = { URL: null };
hand(rep.g.URL);
// an effect in front of the sequence changes WHEN the container is built, never WHICH one it is -
// the nav folds through it like its effect-free twin, in the bound spelling and in place alike
const eff = (note(), { h: { g: globalThis } }).h;
hand(eff.g.Symbol);
hand((note(), { h: { g: globalThis } }).h.g.Number);
