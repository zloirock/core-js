import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Symbol from "@core-js/pure/actual/symbol";
export function ifTestHosted() {
  var _t;
  if ((_t = _globalThis) == null ? void 0 : _nameMaybeFunction(_Symbol)) return 1;
  return 2;
}