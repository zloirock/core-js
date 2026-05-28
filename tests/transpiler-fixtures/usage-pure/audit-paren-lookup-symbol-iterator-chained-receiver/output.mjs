import _getIterator from "@core-js/pure/actual/get-iterator";
// chained optional receiver inside the paren-lookup. line 1: the introducing `?.` sits
// directly before `[Symbol.iterator]` (node.optional). line 2: the `?.` is mid-chain and
// `[Symbol.iterator]` is a non-optional continuation (hasOptionalChainSegment). both must
// emit a bare `_getIterator(receiver)` keeping the receiver's own `?.`, so a nullish
// receiver throws at the call instead of swallowing the throw into void 0
const a = _getIterator(x?.y);
const b = _getIterator(p?.q);
[a, b];