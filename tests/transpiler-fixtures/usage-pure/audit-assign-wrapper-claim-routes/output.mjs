import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _copyWithinMaybeArray from "@core-js/pure/actual/array/instance/copy-within";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
// an assignment host under an array WRAPPER claims what the statement host claims: the element the
// pattern is paired with IS the receiver, so a FLAT claim has one even with no hop chain to resolve,
// and a `?.` the source wrote is a nav all the same - the hop short-circuits the whole chain, so the
// residual and the dispatch read one value
const log = [];
let flat, at, deep, kept, kw, named, keyed, other, stat, zn;
// the SOLE wrapper: the consumed slot leaves and the dispatch takes the statement
// ... a MULTI one keeps the destructure - its neighbour still binds - and appends the dispatch
flat = _flatMaybeArray(_globalThis.Array.prototype);
[{
  at
}, zn] = [_globalThis.Array.prototype, 7];
// a marked nav resolves like the plain one
at = _atMaybeArray(_globalThis.Array.prototype);
// a kept WRITE as the element: the store is a prefix of its own, and the nav reads what it stored
deep = _findLastMaybeArray(_globalThis.Array.prototype);
[kw = _globalThis];
// NEGATIVE: a leaf off the object the hops merely REACH is a name match, not a surface claim
kept = _copyWithinMaybeArray(_globalThis.Array.prototype);
[{
  Array: {
    keys: named
  }
}] = [_globalThis];
// ... and the `?.` buys it no route around that rule: the hop short-circuits the whole chain, so the
// question the marked nav answers is the plain one's
let markedName;
[{
  Array: {
    keys: markedName
  }
}] = [_globalThis];
// NEGATIVE: a FLAT SE-keyed prop over a MEMBER read - the kept key re-reads it in the residual and
// the dispatch would read it again, where the source reads once
[{
  [(_pushMaybeArray(log).call(log, "k"), "flatMap")]: keyed,
  other
}] = [Array.prototype];
// NEGATIVE: a FLAT static under a multi wrapper - its render is the cascade rebuild, which never
// descends one
[{
  of: stat
}, zn] = [Array, 7];
export { flat, at, deep, kept, kw, named, markedName, keyed, other, stat, zn, log };