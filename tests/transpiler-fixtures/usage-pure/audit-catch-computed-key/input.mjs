// Object rest excludes the original key. The iterator symbol is rewritten in the native pattern.
try {
  risky();
} catch ({ [Symbol.iterator]: iter, ...rest }) {
  iter;
  rest;
}
