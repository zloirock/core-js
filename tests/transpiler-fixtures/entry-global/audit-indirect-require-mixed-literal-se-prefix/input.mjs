// mixed prefix: literal `0` (side-effect-free, drops) interleaved with `spy()` (observable,
// preserved). `mayHaveSideEffects` filters per-slot so the pure literals fall out while the
// observable call survives. preserves ordering relative to other surviving prefix slots
function spy() { return 1; }
(0, spy(), 0, require)('core-js/actual/array/from');
