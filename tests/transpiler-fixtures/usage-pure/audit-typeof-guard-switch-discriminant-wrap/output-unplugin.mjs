import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// `switch ((typeof x))` - oxc preserves ParenthesizedExpression / TSAsExpression
// wrappers around the discriminant. the switch-case guard scan's typeof-var test
// would otherwise see a bare ParenthesizedExpression node (not a UnaryExpression-typeof)
// and bail, dropping every case-narrow. paren / TS peel runs before the check
declare const x: string | string[];
switch ((typeof x)) {
  case 'string':
    _atMaybeString(x).call(x, 0);
    break;
}