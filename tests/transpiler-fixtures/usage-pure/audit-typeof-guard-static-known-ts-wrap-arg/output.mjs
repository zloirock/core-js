import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `Array.isArray(x as unknown)` - the known-static-guard arg lookup once peeled only
// ParenthesizedExpression, so a TSAsExpression / `<T>cast` / `!` survived and the arg
// failed the Identifier check, dropping the narrow. peeling the full runtime-transparent
// wrapper set (symmetric with the user-predicate matcher) narrows the element access
// through the array branch
declare const x: string | string[];
if (Array.isArray(x as unknown)) {
  _atMaybeArray(x).call(x, 0);
}