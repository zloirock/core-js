// a fn-local alias NAMED like the global must not shadow the REAL global elsewhere: the
// outer well-known-symbol read still folds (its scope has no such binding)
function globalNamedAlias() {
  const { iterator: Symbol } = globalThis.Symbol;
  return [][Symbol];
}
export const viaGlobalNamedAlias = globalNamedAlias();
