// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
const rows = Object.assign([1, [2]], { extra: 7 });
const nested = [{ y: rows }];
const seen = [];
for (const { at, ...rest } of [rows]) {
  seen.push(typeof at, 'at' in rest, rest.at(0));
}
// the same head one level in, where the claim travels with a renamed array element
for (const [{ y: { at, ...rest } }] of [nested]) {
  seen.push(typeof at, 'at' in rest, rest.at(0));
}
// a bodyless head: the extraction has to build the block it puts the residual in
for (const { at, ...rest } of [rows]) seen.push(typeof at, 'at' in rest);
for (const { at, ...rest } in { a: 1 }) {
  seen.push(typeof at, 'at' in rest);
}
// for-await reaches the head through its own statement type
async function drain(source) {
  for await (const { at, ...rest } of source) {
    seen.push(typeof at, 'at' in rest, rest.extra);
  }
}
// the minted head binding is what the relocated pattern reads, and no scope saw it born: a STATIC
// claim needs its receiver NAMED, so the leg registers the binding it just minted and the guard
// picks the polyfill on the iteration where the element is the constructor the source spelled.
// a MIXED literal is where that guard earns its keep - the mirror cannot spell one element per pass
// there, so the relocation is what serves the claim
for (const { fromEntries } of [Object, { fromEntries: 0 }]) {
  seen.push(typeof fromEntries);
}
// an ALIAS is proven by the VALUE canon, the same one the declaration twin reads it through: the
// mirror spells the constructor the alias holds, since what a const binding holds is not in doubt.
// what the head still cannot serve is a MIXED literal above - one element per pass is unspellable
const Ctor = Object;
for (const { fromEntries: viaAlias } of [Ctor]) {
  seen.push(typeof viaAlias);
}
// a nested leaf beside a SIBLING relocates too: what it buys is the declaration host, and the
// sibling rides along in the residual reading the same memo
for (const { y: { at: viaSibling, keep } } of [{ y: rows, keep: 5 }]) {
  seen.push(typeof viaSibling, keep);
}
export { seen, drain };
