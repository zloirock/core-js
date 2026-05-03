// PROMISE_SYNONYMS aliases PromiseLike / Thenable to Promise upfront in
// resolveNamedType. probe whether mixed PromiseLike + Promise chains unwrap
// transparently to the inner type via Awaited.
type Pulled = Awaited<PromiseLike<Promise<number[]>>>;
declare const arr: Pulled;
const tail = arr.at(-1);
const has = arr.includes(0);
export { tail, has };
