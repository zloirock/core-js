import _Array$from from "@core-js/pure/actual/array/from";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
const from = _Array$from;
// two declarators in the same VariableDeclaration each destructuring from a proxy global.
// both should fully consume their receiver via nested-proxy flatten. asserts that the
// per-decl `rewriteDeclarator` plan walks each declarator independently
const fromEntries = _Object$fromEntries;
export { from, fromEntries };