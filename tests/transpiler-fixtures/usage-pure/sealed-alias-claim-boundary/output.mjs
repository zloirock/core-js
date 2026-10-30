import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
function key(readKey) {
  const alias = null == _globalThis.window ? void 0 : _self;
  return (alias.self, _self)[readKey()];
}
function windowReader(readKey) {
  const alias = null == _globalThis.window ? void 0 : _self;
  return alias.window?.[readKey()];
}
function live(readKey) {
  const alias = null == _globalThis.window ? void 0 : _self;
  return null == alias ? void 0 : _self[readKey()];
}
function guarded(readKey) {
  const alias = null == _globalThis.window ? void 0 : _self;
  return alias && alias[readKey()];
}