// `instanceof` narrowing must peel through TS wrappers (`as`, `!`) on the LHS so the
// guard recognizes `x` as the variable being narrowed. without unwrapRuntimeExpr the guard
// fell back to general `_at` instead of array-specific `_atMaybeArray`
declare const x: unknown;
declare const y: unknown;
function f() {
  if ((x as any) instanceof Array) (x as any[]).at(0);
  if (y! instanceof Array) (y as any[]).at(0);
}
