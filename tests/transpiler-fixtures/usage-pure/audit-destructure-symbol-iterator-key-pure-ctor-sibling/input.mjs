// symbol-iterator key + consumed static sibling on a PURE-ctor proxy-global (`Promise`, whose ctor
// resolves to a bare pure import) with NO side effect: the sibling static extracts to its polyfill
// (`allSettled`) and the symbol key extracts the iterator method. the receiver is a single SE-free
// identifier (`_Promise`), so it inlines directly into the iterator extraction - no superfluous `_ref`
// memo - matching the non-symbol-iter path; both emitters converge (no sidecar)
const { [Symbol.iterator]: it, allSettled } = globalThis.Promise;
it;
allSettled([]);
export { it, allSettled };
