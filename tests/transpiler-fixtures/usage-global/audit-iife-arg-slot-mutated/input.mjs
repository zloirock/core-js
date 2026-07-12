// a SLOT-mutated global as the shadowed IIFE arg: the call-site resolution meets the slot
// canon - usage-global still injects the static (over-inject-safe: the import only enriches
// the pristine ctor, the user's shim owns the runtime read)
globalThis.Array = function ShimArray() {};
!function ({ from }, Array) { use(from); } (Array);
