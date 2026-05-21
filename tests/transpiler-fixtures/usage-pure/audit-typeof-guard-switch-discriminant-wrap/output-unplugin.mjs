import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// `switch ((typeof x))` - oxc preserves ParenthesizedExpression / TSAsExpression
// wrappers around the discriminant. findSwitchCaseGuards' `isTypeofVar` test would
// otherwise see a bare ParenthesizedExpression node (not a UnaryExpression-typeof)
// and bail, dropping every case-narrow. peel via unwrapRuntimeExpr before the check
declare const x: string | string[];
switch ((typeof x)) {
  case 'string':
    _atMaybeString(x).call(x, 0);
    break;
}