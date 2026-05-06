// `((arr?.at) as any)(0)` - paren-wrapped optional member then TS as-wrap, then NON-optional
// outer call. Native: nullish throws TypeError; success preserves `this=arr` through paren
// (Reference Type per ECMA spec). Polyfill emits `(arr == null ? void 0 : _at(arr)).call(arr, 0)`
// to preserve both: `.call` access on undefined throws; success path's `.call(arr, 0)` keeps
// `this`. babel's `isWrappedInParens(path)` peels TS wrappers + checks ParenthesizedExpression
// shape so this fires the parenLookupOnly branch. Distinct method per line so per-line dispatch
// is observable
const a = ((arr?.at) as any)(0);
const b = ((arr?.flat) as any)();
