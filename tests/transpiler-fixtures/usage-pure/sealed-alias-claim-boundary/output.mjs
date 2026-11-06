import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// An alias of an optional realm read keeps ordinary member reads distinct from guarded ones.
// Computed keys run only after their receiver permits the read; pure claims cannot erase the seal.
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