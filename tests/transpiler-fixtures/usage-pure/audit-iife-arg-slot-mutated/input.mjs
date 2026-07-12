// a SLOT-mutated global as the shadowed IIFE arg: NO synth - the arg re-routes through the
// live slot (the user's shim owns its statics), the destructure stays verbatim
globalThis.Array = function ShimArray() {};
!function ({ from }, Array) { use(from); } (Array);
