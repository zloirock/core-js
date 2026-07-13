import _globalThis from "@core-js/pure/actual/global-this";
// a mutated global-proxy SLOT (`window.self = fake`) is owned by the user like any other
// slot: the file-wide taint DEOPTS every `self` surface - reads stay verbatim on the live slot
window.self = fake;
// the slot value read is a raw member read
export const proxySlot = _globalThis.self;
// reads THROUGH the mutated hop keep the raw navigation - the replacement redirects them
const {
  self: {
    Reflect: ViaHop
  }
} = _globalThis;
export const viaHop = ViaHop;
export const flatViaHop = _globalThis.self.Symbol;
// a BARE `self` reference follows the mutated slot too (not the module-cached pure binding)
self.Map = function ShimMap() {};
export const m = new Map();