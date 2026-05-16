import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `class Child extends NS.Base` where the namespace is `declare`-only (ambient). same
// segment-descent path -- `findDeclPathBySegments` matches on the leaf's
// `isClassLikeDeclaration` predicate which accepts `DeclareClass` and ClassDeclaration
// with `declare: true`. the static return type annotation is still read from the ambient
// signature, so `arr` narrows to `number[]` and `.at(0)` dispatches the array-specific
// helper -- the inherited `gather`'s return-type hint propagates through the qualified
// super walk.
declare namespace NS {
  export class Base {
    static gather(x: number): number[];
  }
}
class Child extends NS.Base {}
const arr = Child.gather(1);
_atMaybeArray(arr).call(arr, 0);