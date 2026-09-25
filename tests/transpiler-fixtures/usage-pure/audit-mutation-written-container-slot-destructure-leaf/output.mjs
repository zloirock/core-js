import _Array$from from "@core-js/pure/actual/array/from";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// a container slot the file WROTE no longer holds what the literal spells, and the read routes
// that reach it owe one answer - neither substitutes the literal's value: the member spelling stays
// native, the DESTRUCTURE-LEAF binding guards its read on the candidates. the clean sibling below
// keeps its substitution - the record is per slot, not per file
const box = {
  Array,
  Map: _Map
};
box.Array = FakeArray;
const {
  Array: A
} = box;
(A === Array ? _Array$from : A.from.bind(A))(src);
box.Array.from(src);
const {
  Map: M
} = box;
_Map$groupBy(src, it => it);