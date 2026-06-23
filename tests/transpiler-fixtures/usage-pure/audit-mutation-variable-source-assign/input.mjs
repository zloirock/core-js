// An `Object.assign` / `Object.defineProperties` source given as a const-bound variable resolves to its
// object-literal init, so a copied static key is recorded like an inline literal source - the patch is
// detected and the static read routes through the ponyfill constructor. a const aliased to another const
// (`const aliasSrc = baseSrc`) follows the whole chain to the literal. distinct statics pin which source
// shape was detected.
const assignSrc = { groupBy: patchA };
Object.assign(Map, assignSrc);
const r1 = Map.groupBy(items, fn);
const propsSrc = { try: { value: patchB } };
Object.defineProperties(Promise, propsSrc);
const r2 = Promise.try(fn);
const baseSrc = { from: patchC };
const aliasSrc = baseSrc;
Object.assign(Iterator, aliasSrc);
const r3 = Iterator.from(src);
export { r1, r2, r3 };
