// inline comments inside ObjectPattern must survive the rewrite. a block comment
// between properties tests whether the parser includes them in the
// node range and the comment survives or gets dropped during rewrite
const { /* leading prop comment */ from, /* trailing prop comment */ of } = Array;
export { from, of };
