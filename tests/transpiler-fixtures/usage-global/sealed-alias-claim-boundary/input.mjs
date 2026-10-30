function key(readKey) {
  const alias = globalThis.window?.self;
  return (alias).self[readKey()];
}
function windowReader(readKey) {
  const alias = globalThis.window?.self;
  return (alias).self.window?.[readKey()];
}
function live(readKey) {
  const alias = globalThis.window?.self;
  return alias?.self.window?.[readKey()];
}
function guarded(readKey) {
  const alias = globalThis.window?.self;
  return alias && alias.self.window?.[readKey()];
}
