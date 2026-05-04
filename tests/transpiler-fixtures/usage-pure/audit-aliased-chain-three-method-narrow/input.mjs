// stress alias-chain narrowing under sequential type-resolver invocations: the same
// `_Array$from` binding feeds three distinct narrowing queries triggered by visitor
// callbacks across the same traversal. each chained call queries getBindingInfo via
// typeResolvers' lazy closure - verifies the closure reads a stable currentInjector
// reference for the duration of one transform.
//   - `entries` returns ArrayIterator (iterator-typed return path)
//   - `findLast` returns element (Array-only entry, no generic instance variant)
//   - `slice` returns Array (return-type identity narrowing back to alias source kind)
const fromAlias = Array.from;
const seq = fromAlias('abc');
const it = seq.entries();
const last = seq.findLast(x => x === 'b');
const part = seq.slice(0, 2);
export { it, last, part };
