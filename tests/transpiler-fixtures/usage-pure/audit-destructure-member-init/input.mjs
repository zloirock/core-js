// MemberExpression init (not call) - no resolvedGlobalName, but side-effect-free.
// `needsMemo` only when hasInstance && (entries>1 || remaining || rest). Here we
// have one static `from` + remaining `random` (not polyfillable on Math) - memoize.
const { at, nope } = obj.prop;
