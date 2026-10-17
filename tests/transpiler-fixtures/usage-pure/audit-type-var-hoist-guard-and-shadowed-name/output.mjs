import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// both sides of the guard channel: a guard on the hoisted binding proves the type, but a guard on a
// block-scoped SHADOW of the same name must not reach it. the shadowed row is the negative, so its
// legs must BOTH stay - a spurious narrow there would drop one
declare const unionSrc: string[] | string;
export function viaGuardNarrow() {
  {
    var guarded = unionSrc;
  }
  {
    if (Array.isArray(guarded)) return _atMaybeArray(guarded).call(guarded, 0);
  }
}
export function viaGuardOnShadowedName() {
  {
    var shadowed = unionSrc;
  }
  {
    const shadowed = 42;
    if (Array.isArray(shadowed)) {
      void shadowed;
    }
  }
  {
    return _includes(shadowed).call(shadowed, "x");
  }
}