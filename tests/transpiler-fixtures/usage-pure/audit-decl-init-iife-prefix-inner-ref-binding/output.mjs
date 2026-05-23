import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
(function () {
  var _ref;
  return _atMaybeArray(_ref = [1]).call(_ref, 0);
})();
// VariableDeclaration host with IIFE-bodied SE prefix containing an inner instance-method
// polyfill. `[1].at(0)` registers `var _ref;` inside the IIFE body DURING sibling
// traversal; pre-fix `emitPolyfilled` overwrote [replaceNode.start, end) before the inner
// `_ref` insert was drained, tripping `transform-queue: insert at N lands inside
// overwrite`. now drain happens inside `emitPolyfilled` and the IIFE source is spliced
// to include the ref-declaration before the overwrite is queued
const from = _Array$from;
from([2, 3]);