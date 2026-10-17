// The local `a = true` decides the Array arm for `from`. The unresolved `custom` read keeps the
// original nested calls and selects only the taken call once. The undecided interaction remains
// covered by `nested-call-selection-keeps-an-unresolved-sibling`.
let a = true;
let b = false;
let c = 0;
const { from, custom } = a ? (() => { c++; return Array; })() : (b ? (() => { c++; return Iterator; })() : Array);
from([1]);
