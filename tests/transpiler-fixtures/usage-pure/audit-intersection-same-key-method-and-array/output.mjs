import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// the SAME key declared as a method in one constituent and an array property in another
// (`A.val(): number` + `B.val: number[]`) folds to the array member: intersection folding demotes
// the Function-typed constituent so a concrete container governs `.at`, narrowing to the array variant
interface A {
  val(): number;
}
interface B {
  val: number[];
}
declare const o: A & B;
_atMaybeArray(_ref = o.val).call(_ref, 0);