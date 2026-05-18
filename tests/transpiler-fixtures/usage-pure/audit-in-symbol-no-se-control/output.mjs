import _isIterable from "@core-js/pure/actual/is-iterable";
// control for `visitSymbolInLhsSe`: a SequenceExpression in the computed key whose
// preceding elements have NO side-effects (`(0, 'iterator')`) must not be wrapped as a
// SE-prefix. the rewrite emits the bare polyfill call without a redundant sequence wrap
const r = _isIterable({});