// paren-wrapped optional member used in lookup-only position (NO outer call):
// `(arr?.at)` assigned directly. since `isCall` is false, the standard non-call branch
// emits bare `_at(arr)` (with optional null-check on arr) - not the paren-lookup-only
// special case (which only fires when there's an outer non-optional call). distinct
// methods per line so the per-line dispatch is observable
const a = (arr?.at);
const b = (arr?.flat);
const c = (arr?.includes);
export { a, b, c };
