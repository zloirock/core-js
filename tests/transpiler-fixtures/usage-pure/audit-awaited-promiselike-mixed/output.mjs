import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// PROMISE_SYNONYMS aliases PromiseLike / Thenable to Promise upfront in
// resolveNamedType. probe whether mixed PromiseLike + Promise chains unwrap
// transparently to the inner type via Awaited.
type Pulled = Awaited<PromiseLike<Promise<number[]>>>;
declare const arr: Pulled;
const tail = _atMaybeArray(arr).call(arr, -1);
const has = _includesMaybeArray(arr).call(arr, 0);
export { tail, has };