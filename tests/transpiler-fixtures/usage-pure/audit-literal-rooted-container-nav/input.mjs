// a member nav whose chain starts at the container LITERAL itself folds into the receiver walk
// exactly as one rooted at a NAME does: the walk descends the literal either way, so the keys in
// front of the container are part of the path rather than a reason to stop. every root the walk can
// stand on reaches - an object literal, an array literal, a class expression's statics, a
// transparent sequence around one, and the literal read with no binding between it and the use.
// the two negatives pin the boundary: an effect in front of the sequence leaves the nav unfoldable
// in both flavors, while a slot this file REPLACED is method-aware like every other written-slot
// consult - pure leaves the read native, global over-injects for it
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
