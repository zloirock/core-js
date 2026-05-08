import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// walkStaticReceiverChain dereference loop: chain of three const aliases of `Array`
// (A -> B -> C), then destructure `from` off the leaf. STATIC_WALK_DEPTH bounds the
// alias chain; this stays well below. resolveAliasedStaticReturn must follow the chain
// via staticPairFromDestructure -> walkStaticReceiverChain so `arr.findLast` /
// `arr.at` / `arr.includes` narrow to array-specific dispatch
const A = Array;
const B = A;
const C = B;
const from = _Array$from;
const arr = from('hi');
_findLastMaybeArray(arr).call(arr, c => c);
_atMaybeArray(arr).call(arr, -1);
_includesMaybeArray(arr).call(arr, 'h');