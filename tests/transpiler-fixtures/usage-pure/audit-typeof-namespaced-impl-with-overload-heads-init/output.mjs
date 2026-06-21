import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// namespaced overload heads + impl + INIT (not `declare const`). companion to the existing
// `declare const` namespace-overload fixture - here the binding has an init `NS.fn(0)`, so
// the null type that body inference derives from the init races against the annotation.
// the annotation must win over the init-derived type
namespace NS {
  export function fn(x: string): string;
  export function fn(x: number): number[];
  export function fn(x: any): any {
    return null as any;
  }
}
const r: ReturnType<typeof NS.fn> = NS.fn(0);
_atMaybeArray(r).call(r, 0);