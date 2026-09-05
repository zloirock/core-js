// Bare global reference without invocation. Pure mode should still replace `Map` with `_Map`
// when targets need the polyfill (IE11). Demonstrates baseline identifier visitor contract
const kls = Map;
const proto = Map.prototype;
