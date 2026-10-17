// the throw probe rides the OTHER sealed erase channels too: the prototype-placement swap
// (only the CTOR sub-receiver swaps, `.prototype` survives) and the static-FALLBACK swap
// (the member itself is not polyfilled; an SE hop key rides the probe exactly once)
export const viaSealedProtoMethod = (globalThis.window?.self.window).Map.prototype.has.call(new Map(), 5);
