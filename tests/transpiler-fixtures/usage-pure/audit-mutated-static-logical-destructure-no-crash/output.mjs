import _Set from "@core-js/pure/actual/set/constructor";
// A logical-expression destructure init whose branch is a monkey-patched static must not crash the
// build: the per-branch meta resolves to null for the patched static, so the resolver null-guards
// before reading `.object` (a raw null deref otherwise) and leaves the destructure to route through
// the injected constructor, exactly like the single-receiver mutated path.
Array.from = () => [];
const {
  from
} = Array || _Set;
from([1]);