import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _Map from "@core-js/pure/actual/map/constructor";
import _self from "@core-js/pure/actual/self";
// A function-name helper still evaluates an absent-able realm receiver before reading its name.
const effects = [];
export function read() {
  return typeof _nameMaybeFunction(((() => {
    _pushMaybeArray(effects).call(effects, "prefix");
    return _self;
  })().window.Map, _Map));
}