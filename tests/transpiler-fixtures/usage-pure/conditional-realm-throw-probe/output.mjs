import _globalThis from "@core-js/pure/actual/global-this";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// A plain read above a nullable realm selection keeps its throw.
// The defined arm still supplies the static method.
export const result = ((_globalThis.window == null ? void 0 : _globalThis).self, _Promise$resolve);