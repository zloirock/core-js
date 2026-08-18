// a polyfillable GET reading off a chain that already carries a polyfillable CALL. the method-get in
// the guard test is itself a claim (`_atMaybeArray(arr)`, not a raw `arr.at`), and the tail reads off
// the memoized call result - the two channels that render this share one span, and a stand-down in
// either of them leaves the test reading the method natively.
// the three-level spellings are the shape that decides the OWNER: a GET tail combines like a call
// tail, because the standalone emit rebuilds the optional call off a memoized callee and so splits
// the middle claim's span into two disjoint slots - dropping its polyfill.
const arr = [[[1]]];
const box = { pick: i => arr[i] };
export const optCallThenGet = arr.at?.(0).at;
export const plainCallThenGet = arr.at(0).at;
export const optCallThenPlainTail = arr.at?.(0).length;
export const optOptThenGet = arr.at?.(0).at?.(0).at;
export const optPlainThenGet = arr.at?.(0).at(0).at;
export const plainOptThenGet = arr.at(0).at?.(0).at;
// a spliced hop keeps the receiver type the chain carried: the middle read resolves the SAME
// narrowed helper it resolves without the `?.`, instead of degrading to the generic one
export const optPlainThenCall = arr.at?.(0).at(0).at(0);
// NEGATIVE: a non-polyfillable call under the same tail keeps the native method-get
export const nonPolyCallThenGet = box.pick?.(0).at;
// NEGATIVE: a call tail is the shape the combine owns, and it is unaffected
export const optCallThenCall = arr.at?.(0).at(0);
