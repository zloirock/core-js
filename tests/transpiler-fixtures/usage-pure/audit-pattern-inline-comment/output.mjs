import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// inline comments inside ObjectPattern must survive the rewrite. a block comment
// between properties tests whether the parser includes them in the
// node range and the comment survives or gets dropped during rewrite
const from = _Array$from;
const of = _Array$of;
export { from, of };