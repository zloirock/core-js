// a predicate's parameter list is read off whichever slot the member shape keeps it in: a CLASS
// method (one fused node on babel, a wrapper around a function on ESTree) and a function-typed
// PROPERTY both bind `x` to the argument, so the read narrows to string on both parsers alike
class Checker { isStr(x: unknown): x is string { return typeof x === 'string'; } }
declare const c: Checker;
declare const obj: { isStr: (x: unknown) => x is string };
export function viaClassMethod(input: unknown) {
  if (c.isStr(input)) return input.at(0);
  return null;
}
export function viaFunctionTypedProperty(input: unknown) {
  if (obj.isStr(input)) return input.at(1);
  return null;
}
