import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// An alias of an optional realm read keeps ordinary member reads distinct from guarded ones.
// Computed keys run only after their receiver permits the read; pure claims cannot erase the seal.
function key(readKey) {
  const alias = globalThis.window?.self;
  return alias.self[readKey()];
}
function windowReader(readKey) {
  const alias = globalThis.window?.self;
  return alias.self.window?.[readKey()];
}
function live(readKey) {
  const alias = globalThis.window?.self;
  return alias?.self.window?.[readKey()];
}
function guarded(readKey) {
  const alias = globalThis.window?.self;
  return alias && alias.self.window?.[readKey()];
}