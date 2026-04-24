import _globalThis from "@core-js/pure/actual/global-this";
// `globalThis.Map ||= X` - proxy-global member LHS of logical-assign. same problem as
// the bare-identifier case: plugin would have to substitute a write target, but the
// proxy-global property is what the runtime engine provides. plugin warns and skips
_globalThis.Map ||= {};