// `Int8Array` is a typed-array collection whose first type param (none — it's not generic
// in TS lib) vs element type distinction. SINGLE_ELEMENT_COLLECTIONS doesn't list typed
// arrays. `TypedArray` base class not a TS lib name. Documented hardcoded list — missing
// entries cause generic fallback. Test with a known TS lib type that has known element
// semantics but is NOT in SINGLE_ELEMENT_COLLECTIONS: `Array<T>`-adjacent WeakSet<T>.
// Actually WeakSet is in the list. A confirmed gap: check `AsyncIterable<T>` iteration
// but using `for await` — already tested elsewhere. Let's test a structurally nested ref:
// `T extends { data: U[] }` — works via substitution but exercises resolveElementType.
type Items<T> = { data: T[] };
declare const i: Items<string>['data'];
i.at(0);
i.flat();
