// A logical-expression destructure init whose branch is a monkey-patched static must not crash the
// build: the per-branch meta resolves to null for the patched static, so the resolver null-guards
// before reading `.object` (a raw null deref otherwise) and leaves the patched static to the destructure,
// which reads it off the left the selection always yields (`Array`), like the single-receiver mutated path.
Array.from = () => [];
const {
  from
} = Array;
from([1]);