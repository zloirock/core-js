import _at from "@core-js/pure/actual/instance/at";
var _ref;
// optional-chain `?.` token appearing inside a comment elsewhere in the source must
// not be mistaken for a real chain operator by the rewriter.
a /* ?. */ == null ? void 0 : _at(_ref = a /* ?. */.b).call(_ref, 0);