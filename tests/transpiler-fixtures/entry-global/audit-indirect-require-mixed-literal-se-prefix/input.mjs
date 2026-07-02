// mixed prefix: literal `0` (side-effect-free, drops) interleaved with `spy()` (observable,
// preserved). per-slot filtering drops the pure literals while the observable call survives,
// preserving ordering relative to other surviving prefix slots
function spy() { return 1; }
(0, spy(), 0, require)('core-js/actual/array/from');
