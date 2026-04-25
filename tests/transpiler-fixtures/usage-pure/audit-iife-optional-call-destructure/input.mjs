// `(...)?.(arg)` IIFE: babel emits a distinct OptionalCallExpression node, unplugin (oxc)
// wraps a CallExpression with `optional: true` in ChainExpression. plugins must accept both
// shapes for IIFE detection so synth-swap fires symmetrically across parsers
const a = (({ from }) => from)?.(Array);
const b = (({ groupBy } = Map) => groupBy)?.(Map);
const c = (({ try: t } = Promise) => t)?.(Promise);
export { a, b, c };
