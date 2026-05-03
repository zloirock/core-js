import _at from "@core-js/pure/actual/instance/at";
import _padStartMaybeString from "@core-js/pure/actual/string/instance/pad-start";
var _ref;
// `createParenthesizedExpressions: true` produces nested ParenthesizedExpression nodes
// for `(((expr)))`. the peel loop in `isOptionalOperand` must walk through ALL paren
// levels - a single-pass (`if ParenthesizedExpression then unwrap once`) would miss the
// inner expression and the outer optional chain wouldn't recognise the polyfilled member
// as its operand. lock multi-level parens combined with TS-cast wrappers to exercise
// the same loop's interaction with TS_EXPR_WRAPPERS
const a = _at(arr)?.call(arr, 0);
const b = _padStartMaybeString(_ref = (str as any))?.call(_ref, 8);