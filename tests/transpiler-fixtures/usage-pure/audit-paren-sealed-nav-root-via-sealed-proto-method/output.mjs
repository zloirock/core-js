import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _self from "@core-js/pure/actual/self";
// the throw probe rides the OTHER sealed erase channels too: the prototype-placement swap
// (only the CTOR sub-receiver swaps, `.prototype` survives) and the static-FALLBACK swap
// (the member itself is not polyfilled; an SE hop key rides the probe exactly once)
export const viaSealedProtoMethod = ((null == _globalThis.window ? void 0 : _self.window).Map, _Map).prototype.has.call(new _Map(), 5);