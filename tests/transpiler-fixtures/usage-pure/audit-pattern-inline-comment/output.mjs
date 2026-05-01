import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
const from = _Array$from;
// inline comments inside ObjectPattern - text-rewrite path uses byte-precise slicing
// for non-Identifier transforms but `nodeSrc` for property reconstruction. block comment
// inside the pattern between properties tests whether the parser includes them in the
// node range and the comment survives or gets dropped during rewrite
const of = _Array$of;
export { from, of };