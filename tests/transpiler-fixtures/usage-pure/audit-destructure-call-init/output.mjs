import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
const _ref = getArr();
const at = _at(_ref);
// Call-expression init + multiple instance methods - forces memoization path
// (needsMemo = true because hasInstance && !resolvedGlobalName && entries.length > 1).
// Verifies `const _ref = getArr(); const at = _at(_ref); const includes = _includes(_ref);`
// and NOT double-evaluating `getArr()`.
const includes = _includes(_ref);