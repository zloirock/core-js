// the numeric and string spellings of one slot collapse together too
const numericAndStringSpelling = (function ({ 0: a, '0': b, entries } = Object) {
  return [a, b, entries];
})();
export { numericAndStringSpelling };
