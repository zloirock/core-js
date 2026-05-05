import _Array$from from "@core-js/pure/actual/array/from";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// walkStaticReceiverChain bail: intermediate alias declared with `let` (mutable). The
// shared walker checks adapter.getBindingNodeType returns 'VariableDeclarator' AND that
// constantViolations is empty; reassignable bindings break the static-shape contract.
// Without proper static narrow, `arr.findLast` / `arr.at` / `arr.includes` should still
// emit polyfills but via generic instance-method shapes, not array-narrowed
let A = Array;
const from = _Array$from;
const arr = from('hi');
_findLastMaybeArray(arr).call(arr, c => c);
_atMaybeArray(arr).call(arr, -1);
_includesMaybeArray(arr).call(arr, 'h');