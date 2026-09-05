// a fresh inner `if (typeof x === 'string')` re-narrows after an outer-scope mutation. the
// mutation check must not walk up past this inner conditional to the outer early-exit
// assertion: the `x = ...` between assertion and inner guard is irrelevant because the
// inner guard re-evaluates at runtime and is what narrows x at the usage site.
declare const mixed: string | number[];
function assertString(v: unknown): asserts v is string {}
declare let x: string | number[];
assertString(x);
x = mixed;
if (typeof x === 'string') {
  x.at(0);
}
