// `{ Symbol: S = fallback } = globalThis` wraps S in AssignmentPattern. After babel mutates
// the destructure to `const S = _Symbol === void 0 ? fallback : _Symbol`, the new binding's
// init is a ConditionalExpression — `resolveBindingToGlobal` can't walk that shape to find
// the source global. `handleObjectPropertyResult` pre-registers `S → 'Symbol'` as a global
// alias in the injector, so `S.iterator in obj` still resolves via `asSymbolRef`'s polyfillHint
// path. unplugin isn't affected (no AST mutation; the destructure binding stays intact)
const { Symbol: S = () => null } = globalThis;
S.iterator in obj;
