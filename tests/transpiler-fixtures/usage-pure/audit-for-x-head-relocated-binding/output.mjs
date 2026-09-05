import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _at from "@core-js/pure/actual/instance/at";
import _Object$assign from "@core-js/pure/actual/object/assign";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// a for-x HEAD holds no statement list, so extracting a claim out of it moves what the pattern still
// binds into the loop BODY and leaves a record naming the minted iteration variable. reading the
// type off that dead head answers the ITERATED element instead: an object rest resolves Array, which
// folds a presence test to `true` and dispatches the array-specific helper onto a plain object
const rows = _Object$assign([1, [2]], {
  extra: 7
});
const nested = [{
  y: rows
}];
const seen = [];
for (const _ref of [rows]) {
  let at = _atMaybeArray(_ref);
  let {
    at: _unused,
    ...rest
  } = _ref;
  // the rest is the type in plain sight: a plain object carries no `at`, so the read stays RAW and
  // throws exactly where native throws - the array-specific helper here would be the head's element
  // type answering for a value that never had it, and the presence test would fold to `true`
  _pushMaybeArray(seen).call(seen, typeof at, 'at' in rest, rest.at(0));
}
// the same head one level in, where the claim travels with a renamed array element
for (const _ref3 of [nested]) {
  let [_ref2] = _ref3;
  let _ref4 = _ref2.y;
  let at = _atMaybeArray(_ref4);
  let {
    at: _unused2,
    ...rest
  } = _ref4;
  _pushMaybeArray(seen).call(seen, typeof at, 'at' in rest, rest.at(0));
}
// a bodyless head: the extraction has to build the block it puts the residual in
for (const _ref5 of [rows]) {
  let at = _atMaybeArray(_ref5);
  let {
    at: _unused3,
    ...rest
  } = _ref5;
  _pushMaybeArray(seen).call(seen, typeof at, 'at' in rest);
}
// for-in binds the KEY, so the rest gathers what a string carries - the head is dead all the same
for (const _ref6 in {
  a: 1
}) {
  let at = _atMaybeString(_ref6);
  let {
    at: _unused4,
    ...rest
  } = _ref6;
  _pushMaybeArray(seen).call(seen, typeof at, 'at' in rest);
}
// for-await reaches the head through its own statement type
async function drain(source) {
  for await (const _ref7 of source) {
    let at = _at(_ref7);
    let {
      at: _unused5,
      ...rest
    } = _ref7;
    _pushMaybeArray(seen).call(seen, typeof at, 'at' in rest, rest.extra);
  }
}
// the minted head binding is what the relocated pattern reads, and no scope saw it born: a STATIC
// claim needs its receiver NAMED, so the leg registers the binding it just minted and the guard
// picks the polyfill on the iteration where the element is the constructor the source spelled.
// a MIXED literal is where that guard earns its keep - the mirror cannot spell one element per pass
// there, so the relocation is what serves the claim
for (const _ref8 of [Object, {
  fromEntries: 0
}]) {
  let fromEntries = _ref8 === Object ? _Object$fromEntries : _ref8.fromEntries;
  _pushMaybeArray(seen).call(seen, typeof fromEntries);
}
// NEGATIVE: the element must SPELL the global it names - an alias holds whatever was written into
// it, and the one the plugin mints for its own import is invisible to the scope
const Ctor = Object;
for (const {
  fromEntries: viaAlias
} of [Ctor]) {
  _pushMaybeArray(seen).call(seen, typeof viaAlias);
}
// a nested leaf beside a SIBLING relocates too: what it buys is the declaration host, and the
// sibling rides along in the residual reading the same memo
for (const _ref9 of [{
  y: rows,
  keep: 5
}]) {
  const _ref10 = _ref9.y;
  let viaSibling = _atMaybeArray(_ref10);
  let {
    keep
  } = _ref10;
  _pushMaybeArray(seen).call(seen, typeof viaSibling, keep);
}
export { seen, drain };