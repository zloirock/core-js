// `(...)?.(arg)` optional IIFE: babel emits OptionalCallExpression, oxc wraps a
// CallExpression `optional: true` inside ChainExpression. both shapes must be recognised
// as IIFEs so the receiver-arg rewrite fires symmetrically across parsers
const a = (({ from }) => from)?.(Array);
const b = (({ groupBy } = Map) => groupBy)?.(Map);
const c = (({ try: t } = Promise) => t)?.(Promise);
export { a, b, c };
