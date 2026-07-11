import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _self from "@core-js/pure/actual/self";
// a mutated global-proxy SLOT (`window.self = fake`) is owned by the user like any other
// slot: the file-wide taint re-routes EVERY `self` surface through the live slot
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
(_globalThis.self === undefined ? _self : _globalThis.self).Map = function ShimMap() {};
export const m = new (_globalThis.Map === undefined ? _Map : _globalThis.Map)();