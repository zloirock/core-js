// catch-clause rewrite (well-known Symbol key triggers param -> _ref) co-located with a polyfill
// at a SUB-range inside the pattern (an instance-method call in a computed key). the sub-range
// transform must be drained and baked into the relocated prelude, not orphaned inside the bare
// `_ref` overwrite. regression lock
try {} catch ({ [Symbol.iterator]: it, [[1].at(0)]: b }) { it(); b; }
