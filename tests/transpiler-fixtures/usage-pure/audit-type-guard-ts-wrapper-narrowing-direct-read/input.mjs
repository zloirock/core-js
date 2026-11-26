// `instanceof` narrowing must look through `as` and `!` TS wrappers on the
// LHS so that the array-specific polyfill is selected for the narrowed
// variable rather than the generic instance-method fallback.
declare const x: any;
declare const y: any;
function f() {
  if ((x as any) instanceof Array) x.at(0);
  if (y! instanceof Array) y.at(0);
}
