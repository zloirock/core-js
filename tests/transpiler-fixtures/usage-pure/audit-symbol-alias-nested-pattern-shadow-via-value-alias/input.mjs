// a binding holding a well-known-symbol VALUE (not the constructor) is NOT a Symbol source:
// destructuring `iterator` OFF that value reads `(symbol).iterator` (undefined at runtime),
// so the consumer must keep the raw read and the default - while a direct computed read of
// the VALUE alias itself still folds (it IS the well-known key)
function valueAliasHost() {
  const { iterator: Symbol } = globalThis.Symbol;
  const { iterator: viaValue = 'fb' } = Symbol;
  return ['v'][viaValue];
}
export const viaValueAlias = valueAliasHost();
