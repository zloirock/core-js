// a polyfillable GET reading off a chain that already carries a polyfillable CALL. the method-get in
// the guard test is itself a claim (`_atMaybeArray(arr)`, not a raw `arr.at`), and the tail reads off
// the memoized call result - the two channels that render this share one span, and a stand-down in
// either of them leaves the test reading the method natively.
// the three-level spellings of the same shape are a KNOWN crash of the text emitter's queue and are
// deliberately absent: locking them would pin the defect as expected output.
const arr = [[1]];
const box = { pick: i => arr[i] };
export const optCallThenGet = arr.at?.(0).at;
export const plainCallThenGet = arr.at(0).at;
export const optCallThenPlainTail = arr.at?.(0).length;
// NEGATIVE: a non-polyfillable call under the same tail keeps the native method-get
export const nonPolyCallThenGet = box.pick?.(0).at;
// NEGATIVE: a call tail is the shape the combine owns, and it is unaffected
export const optCallThenCall = arr.at?.(0).at(0);
