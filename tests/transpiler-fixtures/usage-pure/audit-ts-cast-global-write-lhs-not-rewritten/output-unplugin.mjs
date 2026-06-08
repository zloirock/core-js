// usage-pure: a global at an assignment / for-x-head / logical-assign LHS wrapped in a transparent
// expression wrapper must NOT be rewritten to the frozen pure import - the write would TypeError on
// the immutable ESM binding. the write-LHS reject must peel the FULL TS_EXPR_WRAPPERS + paren set
// (as / <> / satisfies / non-null / nested) via the shared peelTransparentExprAncestorPath, matching
// babel-plugin; the prior inline peel only stripped TSNonNull / paren, so casts slipped through and
// the global was over-substituted. distinct globals + every wrapper x write-form combination below;
// all 6 globals rewrite in READ position (covered by other fixtures), so the absence of any import
// here is the assertion. nested `((WeakSet as any))` exercises the recursive peel
(Map as any) = x;
(<any>Set) = y;
(Promise satisfies any) ||= z;
WeakMap! += 1;
((WeakSet as any)) = w;
for ((Symbol as any) of arr) {}