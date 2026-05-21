import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// argPath wraps the literal in a TSAsExpression (`'a' as const`). resolveRuntimeExpression
// peels TS expression wrappers (`as const`, `satisfies T`, `<T>x` casts) before the
// literal-kind check fires - without the peel the raw TSAsExpression node fails both
// `isLiteralOf` branches and the rewrite drops, leaving K opaque
type Items = {
  a: string[];
  b: number[];
};
declare function pick<K extends keyof Items>(k: K): Items[K];
_atMaybeArray(_ref = pick('a' as const)).call(_ref, 0);