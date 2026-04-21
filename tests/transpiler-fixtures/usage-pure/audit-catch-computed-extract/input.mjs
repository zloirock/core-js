// computed-key destructure in a catch clause: emitCatchClause calls transforms.extractContent
// on the key range — exercises #byRange lookup + splice + rebuildPrefixMax
try {
  risky();
} catch ({ [Symbol.iterator]: iter, ...rest }) {
  use(iter, rest);
}
