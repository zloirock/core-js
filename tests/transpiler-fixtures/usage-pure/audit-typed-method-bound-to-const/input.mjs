// `const f = api.getTags` extracts a typed method - `f`'s type is the method itself
// (a callable signature), and `f()` returns the method's declared return type. a bare
// member access on a method must yield the TSMethodSignature node, not its return type,
// so the const sees a function-shaped annotation. collapsing the slot to the return type
// (as if `api.getTags` were called) mis-types `f` as string[] and routes `f()` through
// generic dispatch instead of emitting `_atMaybeArray` on the array-return result
type API = {
  getTags(): string[];
};
declare const api: API;
const f = api.getTags;
f().at(0);
