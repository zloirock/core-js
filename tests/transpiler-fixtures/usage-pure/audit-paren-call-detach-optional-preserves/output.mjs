import _includes from "@core-js/pure/actual/instance/includes";
// optional-chain paren-detach preservation: `(arr?.includes)(1)` keeps the parenthesized
// detach (`(_includes(arr))(1)` - no `.call(arr)` injection). The paren-detection covers
// both shapes a parser may produce: a flag on the inner node or an explicit paren wrapper
// as a separate AST node
const v = (arr == null ? void 0 : _includes(arr))(1);