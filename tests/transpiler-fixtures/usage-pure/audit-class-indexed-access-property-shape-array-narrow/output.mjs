import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// negative-shape pin: property (NOT method) indexed-access `C<number[]>['items']` must
// continue to peel to the value type, not be mistaken for function-type. ensures the new
// method-shape branch in resolveIndexedAccessMemberAnnotationAST doesn't over-trigger on
// property-shape members. PropertyDefinition class field is the parser-divergent case -
// babel emits ClassProperty / TSAbstractPropertyDefinition variants too
class C<V> {
  items: V;
}
type Items = C<number[]>['items'];
declare const arr: Items;
_atMaybeArray(arr).call(arr, 0);