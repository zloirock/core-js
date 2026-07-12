import _globalThis from "@core-js/pure/actual/global-this";
// a SLOT-mutated global as the shadowed IIFE arg: NO synth - the arg re-routes through the
// live slot (the user's shim owns its statics), the destructure stays verbatim
_globalThis.Array = function ShimArray() {};
!function ({
  from
}, Array) {
  use(from);
}(_globalThis.Array);