import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// transitive merged-interface extends: `interface C extends B`, `interface B extends A`.
// Type-member lookup walks A -> B -> (class C's body) -> interface C body. The interface-
// extends-members append step recurses into parents so the chain reaches A's `items`
// without collapsing at B
interface A {
  items: number[];
}
interface B extends A {}
class C {}
interface C extends B {}
declare const c: C;
_atMaybeArray(_ref = c.items).call(_ref, 0);