import _Array$from from "@core-js/pure/actual/array/from";
// `const { self: { Array: { from } } } = globalThis` - 3-level nested proxy destructure.
// tryFlattenNestedProxyDestructure used to give up at 2-level depth (direct-parent chain
// only), so 3+ level nests were silent no-op's. N-deep walk now unwinds the property
// cascade from innermost outward
const from = _Array$from;
from(xs);