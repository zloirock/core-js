import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref;
// optional-chain `?.` token appearing inside a template-literal expression must not
// be mistaken for a top-level chain operator by the rewriter.
_atMaybeString(_ref = `${a?.b}`).call(_ref, 0);