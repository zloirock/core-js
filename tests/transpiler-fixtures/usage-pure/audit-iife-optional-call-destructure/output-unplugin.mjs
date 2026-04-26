import _Array$from from "@core-js/pure/actual/array/from";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Map from "@core-js/pure/actual/map/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
import _Promise from "@core-js/pure/actual/promise/constructor";
// `(...)?.(arg)` optional IIFE: babel emits OptionalCallExpression, oxc wraps a
// CallExpression `optional: true` inside ChainExpression. both shapes must be recognised
// as IIFEs so the receiver-arg rewrite fires symmetrically across parsers
const a = (({ from }) => from)?.({ from: _Array$from });
const b = (({ groupBy } = _Map) => groupBy)?.({ groupBy: _Map$groupBy });
const c = (({ try: t } = _Promise) => t)?.({ try: _Promise$try });
export { a, b, c };