import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// namespaced overload heads + impl + INIT (not `declare const`). companion to the existing
// `declare const` namespace-overload fixture - here the binding has an init walk through
// `NS.fn(0)`, so init-derived `$Primitive('null')` from body inference races against the
// annotation. `preferAnnotationOverExpression` ensures the annotation wins
namespace NS {
  export function fn(x: string): string;
  export function fn(x: number): number[];
  export function fn(x: any): any {
    return null as any;
  }
}
const r: ReturnType<typeof NS.fn> = NS.fn(0);
_atMaybeArray(r).call(r, 0);