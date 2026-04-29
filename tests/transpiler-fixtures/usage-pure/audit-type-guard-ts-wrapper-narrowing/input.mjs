// `instanceof` narrowing must look through `as` and `!` TS wrappers on the
// LHS so that the array-specific polyfill is selected for the narrowed
// variable rather than the generic instance-method fallback.
declare const x: unknown;
declare const y: unknown;
function f() {
  if ((x as any) instanceof Array) (x as any[]).at(0);
  if (y! instanceof Array) (y as any[]).at(0);
}
