import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Object$assign from "@core-js/pure/actual/object/assign";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// Object-rest keeps the affected loop pattern native at its original evaluation point.
// Independent reads and key/default expressions still receive their own polyfills.
const rows = _Object$assign([1, [2]], {
  extra: 7
});
const nested = [{
  y: rows
}];
const seen = [];
for (const {
  at,
  ...rest
} of [rows]) {
  _pushMaybeArray(seen).call(seen, typeof at, 'at' in rest, rest.at(0));
}
// the same head one level in, where the claim travels with a renamed array element
for (const [{
  y: {
    at,
    ...rest
  }
}] of [nested]) {
  _pushMaybeArray(seen).call(seen, typeof at, 'at' in rest, rest.at(0));
}
// a bodyless head: the extraction has to build the block it puts the residual in
for (const {
  at,
  ...rest
} of [rows]) _pushMaybeArray(seen).call(seen, typeof at, 'at' in rest);
for (const {
  at,
  ...rest
} in {
  a: 1
}) {
  _pushMaybeArray(seen).call(seen, typeof at, 'at' in rest);
}
// for-await reaches the head through its own statement type
async function drain(source) {
  for await (const {
    at,
    ...rest
  } of source) {
    _pushMaybeArray(seen).call(seen, typeof at, 'at' in rest, rest.extra);
  }
}
// the minted head binding is what the relocated pattern reads, and no scope saw it born: a STATIC
// claim needs its receiver NAMED, so the leg registers the binding it just minted and the guard
// picks the polyfill on the iteration where the element is the constructor the source spelled.
// a MIXED literal is where that guard earns its keep - the mirror cannot spell one element per pass
// there, so the relocation is what serves the claim
for (const {
  fromEntries
} of [{
  fromEntries: _Object$fromEntries
}, {
  fromEntries: 0
}]) {
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
for (const _ref of [{
  y: rows,
  keep: 5
}]) {
  const _ref2 = _ref.y;
  let viaSibling = _atMaybeArray(_ref2);
  let {
    keep
  } = _ref2;
  _pushMaybeArray(seen).call(seen, typeof viaSibling, keep);
}
export { seen, drain };