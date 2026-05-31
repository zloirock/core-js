// catch destructure where an ENTRY prop carries a DEFAULT whose value is itself polyfillable
// (`it = [9].flat()`). the catch param becomes bare `_ref`, leaving no original-text needle for
// the default's polyfill to compose against, so the default must be drained and emitted in its
// baked form - emitting the raw default would drop the polyfill and orphan its scoped var.
// distinct from the computed-key sub-range case. regression lock
try {} catch ({ [Symbol.iterator]: it = [9].flat() }) { it; }
