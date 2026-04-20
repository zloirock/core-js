import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// `(a?.b as string[]).at(0)` - findChainRoot must recognise TSAsExpression as a transparent
// wrapper and still deopt the `?.` chain; regex-guard would otherwise trip on `(a?.b as X)`
declare const a: {
  b: string[] | null;
} | null;
_atMaybeArray(_ref = a?.b as string[]).call(_ref, 0);