import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _self from "@core-js/pure/actual/self";
// The detached guard serves the realm global even when a prefix and a store precede the constructor.
let held;
export const value = null == (prefix(), held = _globalThis.window) ? void 0 : _Map.unknown;
const realm = _globalThis;
export const fromAlias = null == (prefix(), inner(), _self) ? void 0 : _Map.unknown;