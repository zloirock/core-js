import _Array$from from "@core-js/pure/actual/array/from";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Map from "@core-js/pure/actual/map/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
import _Promise from "@core-js/pure/actual/promise/constructor";
// `(...)?.(arg)` IIFE: babel emits a distinct OptionalCallExpression node, unplugin (oxc)
// wraps a CallExpression with `optional: true` in ChainExpression. plugins must accept both
// shapes for IIFE detection so synth-swap fires symmetrically across parsers
const a = (({ from }) => from)?.({ from: _Array$from });
const b = (({ groupBy } = _Map) => groupBy)?.({ groupBy: _Map$groupBy });
const c = (({ try: t } = _Promise) => t)?.({ try: _Promise$try });
export { a, b, c };