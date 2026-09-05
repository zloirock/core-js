// a for-x HEAD holds no statement list, so extracting a claim out of it moves what the pattern still
// binds into the loop BODY and leaves a record naming the minted iteration variable. reading the
// type off that dead head answers the ITERATED element instead: an object rest resolves Array, which
// folds a presence test to `true` and dispatches the array-specific helper onto a plain object
const rows = Object.assign([1, [2]], { extra: 7 });
const nested = [{ y: rows }];
const seen = [];
for (const { at, ...rest } of [rows]) {
  // the rest is the type in plain sight: a plain object carries no `at`, so the read stays RAW and
  // throws exactly where native throws - the array-specific helper here would be the head's element
  // type answering for a value that never had it, and the presence test would fold to `true`
  seen.push(typeof at, 'at' in rest, rest.at(0));
}
// the same head one level in, where the claim travels with a renamed array element
for (const [{ y: { at, ...rest } }] of [nested]) {
  seen.push(typeof at, 'at' in rest, rest.at(0));
}
// a bodyless head: the extraction has to build the block it puts the residual in
for (const { at, ...rest } of [rows]) seen.push(typeof at, 'at' in rest);
// for-in binds the KEY, so the rest gathers what a string carries - the head is dead all the same
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
// NEGATIVE: the element must SPELL the global it names - an alias holds whatever was written into
// it, and the one the plugin mints for its own import is invisible to the scope
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
