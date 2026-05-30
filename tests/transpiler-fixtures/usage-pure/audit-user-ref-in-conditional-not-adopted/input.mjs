// user writes an undeclared `_ref` as a direct ternary branch and as a chained assignment RHS.
// the plugin only emits its own `_ref` memos inside `null == (...)` tests or call arguments,
// never in these positions, so it must RESERVE the user's `_ref` (allocate its own memo as
// `_ref2`) rather than adopt the name and rehydrate a `var _ref;` the user never wrote
const a = cond ? (_ref = compute()) : fallback();
const b = obj?.at(0).flat();
