// mixed gap between `?.` and the next token: whitespace, block comment, whitespace,
// line comment, newline. the helper must walk each kind in order. each line uses a
// distinct polyfilled method: includes / flat / endsWith
const a = arr?.  /* a */ // b
  includes(1);
const b = arr?.  /* a */ // b
  flat();
const c = str?.  /* a */ // b
  endsWith('x');
