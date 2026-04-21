// Catch + computed key [Symbol.iterator]: emitCatchClause extracts the computed key
// transform so composition doesn't corrupt `_Symbol$iterator` into `__Symbol$iterator`.
// `get-iterator-method` is the correct entry binding.
try {
  risky();
} catch ({ [Symbol.iterator]: iter, ...rest }) {
  iter;
  rest;
}
