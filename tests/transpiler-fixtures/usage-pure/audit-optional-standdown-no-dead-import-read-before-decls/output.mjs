import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise";
// declaration ORDER does not break the proof: the closure reads aliases declared after it -
// a legal call still sees the assigned globals, and an early call throws the same TDZ
// ReferenceError raw or guarded (faithful-throw)
export function readBeforeDecls() {
  return null == laterAlias.window ? void 0 : _Promise;
}
const laterG = _globalThis;
const laterAlias = laterG;