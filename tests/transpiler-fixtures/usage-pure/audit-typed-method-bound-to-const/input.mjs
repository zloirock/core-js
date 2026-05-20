// `const f = api.getTags` extracts a typed method - `f`'s type is the method itself
// (a callable signature). `f()` then returns the method's declared return type.
// `resolveMemberInTypeMembers` must yield the TSMethodSignature node (not its return
// type) when the member-access result is the bare method, so the const-binding sees a
// function-shaped annotation. previously the function-typed slot collapsed to the
// return type as if `api.getTags` was implicitly called, mis-typing `f` as string[]
// and routing `f()` (a call on string[]) through generic dispatch instead of correctly
// emitting `_atMaybeArray` on the array-return result
type API = {
  getTags(): string[];
};
declare const api: API;
const f = api.getTags;
f().at(0);
