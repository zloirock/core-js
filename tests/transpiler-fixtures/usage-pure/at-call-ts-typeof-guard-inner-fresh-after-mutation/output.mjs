import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// inner fresh conditional re-narrows after a mutation in the outer scope. without the
// `innerFreshConditional` flag, `hasMutationAfterGuards` walks up to the outer-scope
// early-exit assertion, sees the `x = ...` mutation between the assertion and the inner
// conditional, and bails the narrowing - even though the inner `if (typeof x === 'string')`
// re-evaluates at runtime and is what's actually narrowing x at the usage site
declare const mixed: string | number[];
function assertString(v: unknown): asserts v is string {}
declare let x: string | number[];
assertString(x);
x = mixed;
if (typeof x === 'string') {
  _atMaybeString(x).call(x, 0);
}