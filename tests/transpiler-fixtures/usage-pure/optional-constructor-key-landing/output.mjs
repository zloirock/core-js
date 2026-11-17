import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _Map from "@core-js/pure/actual/map/constructor";
// A constructor landing preserves the effect before its optional name read.
// The effect runs once even when the constructor is supplied by a ponyfill.
export const effects = [];
export const r = _nameMaybeFunction((_pushMaybeArray(effects).call(effects, "key"), _Map));