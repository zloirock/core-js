import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// A delete through a saved environment probe keeps the guard over that probe.
const held = _globalThis.window;
let saved;
null == (saved = held) ? true : delete _self.Array.temporary;