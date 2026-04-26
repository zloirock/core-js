// optional IIFE form `(arrow)?.(arg)`: when the IIFE arg is a known constructor (`Array`,
// `Map`, `Promise`), the destructured method should still resolve to its static polyfill
// (parity with the non-optional `(arrow)(arg)` form).
const a = (({ from }) => from)?.(Array);
const b = (({ groupBy } = Map) => groupBy)?.(Map);
const c = (({ try: t } = Promise) => t)?.(Promise);
export { a, b, c };
