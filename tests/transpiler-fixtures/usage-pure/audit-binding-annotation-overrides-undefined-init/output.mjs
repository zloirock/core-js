import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// body inference of `function (): any { return undefined as any; }` yields
// `$Primitive('undefined')`. with no overload heads to retarget `typeof opaque`, the init
// walk of `const arr: number[] = opaque()` would otherwise leak that scalar to `arr` and
// drop the `.includes()` narrow. `preferAnnotationOverExpression.overridesNullish` covers
// the undefined branch symmetrically with the null branch
function opaque(): any {
  return undefined as any;
}
const arr: number[] = opaque();
_includesMaybeArray(arr).call(arr, 42);