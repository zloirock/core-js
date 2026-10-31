import _Array$from from "@core-js/pure/actual/array/from";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
// The local `a = true` decides the Array arm for `from`. The unresolved `custom` read keeps the
// original nested calls and selects only the taken call once. The undecided interaction remains
// covered by `nested-call-selection-keeps-an-unresolved-sibling`.
let a = true;
let b = false;
let c = 0;
const from = _Array$from;
const {
  custom
} = a ? (() => {
  c++;
  return Array;
})() : b ? (() => {
  c++;
  return _Iterator;
})() : Array;
from([1]);