import _Array$from from "@core-js/pure/actual/array/from";
// bodyless `if` with SE init containing a polyfillable call. wrapBodylessWithSideEffect
// lifts the SE into a block, cloneDeep'ing the init node. babel's `replaceWith` re-queues
// the new subtree so the cloned `Array.from(xs)` inside the block is still polyfill-scanned
if (cond) {
  _Array$from(xs), Array;
  var from = _Array$from;
}