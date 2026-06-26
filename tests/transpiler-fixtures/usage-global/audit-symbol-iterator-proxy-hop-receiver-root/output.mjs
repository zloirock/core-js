import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.self";
// usage-global parity for a proxy-global HOP receiver of `[Symbol.iterator]`: usage-global keeps the member
// verbatim and injects the symbol / iterator polyfills - it must resolve the well-known symbol through the
// proxy hop without collapsing the receiver (usage-pure's collapse had to pick a consistent root). mirrors the
// pure receiver set: single hop, deep hop, optional hop, get-call hop, a paren-wrapped hop, bare root and a
// real-object control.
const single = globalThis.self[Symbol.iterator];
const deep = globalThis.self.window[Symbol.iterator];
const optional = globalThis?.self[Symbol.iterator];
const getCall = [...globalThis.self[Symbol.iterator]()];
const parenWrapped = globalThis.self[Symbol.iterator];
const bare = globalThis[Symbol.iterator];
const real = [1][Symbol.iterator];
export { single, deep, optional, getCall, parenWrapped, bare, real };