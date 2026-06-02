import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// a generic abstract method reached via an indexed-access binding (`C<number>['m']`) keeps its
// element type: `f()` is `number[]`, so `.at` narrows to the array variant. oxc models the abstract
// method as TSAbstractMethodDefinition (return type on `.value`), which must thread through the
// same dispatch / method-shape / member-match / call-return layers as MethodDefinition
abstract class C<T> {
  abstract m(): T[];
}
declare const f: C<number>["m"];
const r = f();
_atMaybeArray(r).call(r, 0);