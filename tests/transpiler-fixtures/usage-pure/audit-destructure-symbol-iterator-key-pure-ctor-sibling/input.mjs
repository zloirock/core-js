// A `[Symbol.iterator]` key beside a claimed static off a realm constructor that has a ponyfill
// (`globalThis.Promise`): with no rest and no effect both extract, the static from its own entry and
// the iterator method from the constructor's ponyfill, read directly with no memo of the receiver.
const { [Symbol.iterator]: it, allSettled } = globalThis.Promise;
it;
allSettled([]);
export { it, allSettled };
