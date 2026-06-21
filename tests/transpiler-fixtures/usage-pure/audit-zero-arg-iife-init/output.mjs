import _Array$from from "@core-js/pure/actual/array/from";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref;
// `const fromMethod = (() => Array.from)()` - a zero-arg arrow IIFE evaluates to its
// expression body, so the var-init must be peeled to that body or the alias-walked
// static-return identity stays opaque and the chain narrow drops. parser-divergence: oxc
// keeps the outer parens around the IIFE callee (CallExpression -> ParenthesizedExpression
// -> ArrowFunction) while babel strips them; peeling both shapes lands `_includesMaybeArray`
const fromMethod = (() => _Array$from)();
_includesMaybeArray(_ref = fromMethod([1, 2, 3])).call(_ref, 1);