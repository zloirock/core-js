import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `class Child extends NS.Base` where the namespace is `declare`-only (ambient). the
// segment-descent must accept the ambient leaf (`DeclareClass` / `ClassDeclaration` with
// `declare: true`), so the static return type is read from the ambient signature: `arr`
// narrows to `number[]` and `.at(0)` dispatches the array-specific helper.
declare namespace NS {
  export class Base {
    static gather(x: number): number[];
  }
}
class Child extends NS.Base {}
const arr = Child.gather(1);
_atMaybeArray(arr).call(arr, 0);