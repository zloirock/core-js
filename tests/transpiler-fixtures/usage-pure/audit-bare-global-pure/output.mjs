import _Map from "@core-js/pure/actual/map/constructor";
// Bare global reference without invocation. Pure mode should still replace `Map` with `_Map`
// when targets need the polyfill (IE11). Demonstrates baseline identifier visitor contract
const kls = _Map;
const proto = _Map.prototype;