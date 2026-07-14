import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.includes";
// both sides of the guard channel: a guard on the hoisted binding proves the type, but a guard on a
// block-scoped SHADOW of the same name must not reach it. the shadowed row is the negative, so its
// legs must BOTH stay - a spurious narrow there would drop one
declare const unionSrc: string[] | string;
export function viaGuardNarrow() {
  {
    var guarded = unionSrc;
  }
  {
    if (Array.isArray(guarded)) return guarded.at(0);
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
    return shadowed.includes("x");
  }
}