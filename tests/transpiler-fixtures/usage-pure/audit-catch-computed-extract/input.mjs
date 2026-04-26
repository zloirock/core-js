// computed-key destructure in a catch clause: the well-known symbol key is preserved
// verbatim in the rebuilt rest pattern so the extracted iterator helper still resolves
// to the same key at runtime
try {
  risky();
} catch ({ [Symbol.iterator]: iter, ...rest }) {
  use(iter, rest);
}
