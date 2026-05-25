// inline comments inside ObjectPattern - text-rewrite path uses byte-precise slicing
// for non-Identifier transforms but `original-source slice` for property reconstruction. block comment
// inside the pattern between properties tests whether the parser includes them in the
// node range and the comment survives or gets dropped during rewrite
const { /* leading prop comment */ from, /* trailing prop comment */ of } = Array;
export { from, of };
