import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// The optional link guards the value just stored, including a backed hop above it.
const held = _globalThis.window;
let saved;
null == (saved = held) ? void 0 : _self.Array.isArray([]);