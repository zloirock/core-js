import _Array$from from "@core-js/pure/actual/array/from";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref;
// `const fromMethod = (() => Array.from)()` - zero-arg arrow IIFE evaluates to its
// expression body at runtime. followableVarInit returned the CallExpression as-is,
// leaving `fromMethod`'s alias-walked identity opaque to resolveAliasedStaticReturn
// and dropping the chain narrow. peel IIFE when the body is expression-only and the
// callee is a zero-param arrow. parser-divergence: oxc preserves outer parens around
// the IIFE callee (`CallExpression { callee: ParenthesizedExpression { ArrowFunction }}`)
// while babel strips them - the peel uses `unwrapRuntimeExpr` on the callee node and
// walks the matching `.get('expression')` chain on the path side so both shapes resolve
// identically and the chain narrow lands `_includesMaybeArray` on both parsers
const fromMethod = (() => _Array$from)();
_includesMaybeArray(_ref = fromMethod([1, 2, 3])).call(_ref, 1);