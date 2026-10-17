import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
class Extended extends (null == _globalThis.window ? void 0 : _self.hostBox.Base) {}
export const extendedName = _nameMaybeFunction(Extended);