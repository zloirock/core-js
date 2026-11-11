import _Array$from from "@core-js/pure/actual/array/from";
// The local `a = true` decides the Array arm for `from`. The unresolved `custom` read keeps the
// original nested calls and selects only the taken call once. The undecided interaction remains
// covered by `nested-call-selection-keeps-an-unresolved-sibling`.
let a = true;
let b = false;
let c = 0;
const _ref = (() => {
    c++;
    return Array;
  })(),
  from = _Array$from,
  {
    custom
  } = _ref;
from([1]);