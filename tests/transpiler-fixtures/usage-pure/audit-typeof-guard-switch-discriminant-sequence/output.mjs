import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// `switch ((side(), typeof x))` - SequenceExpression around discriminant evaluates to
// the tail (typeof x). unwrapRuntimeExpr stripped paren / TS only; switched to
// unwrapExpressionChain which also peels SE-tail so the case-narrow surfaces same as
// bare `switch (typeof x)`
declare const x: string | string[];
declare function ping(): void;
switch (ping(), typeof x) {
  case 'string':
    _atMaybeString(x).call(x, 0);
    break;
}