import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// An absent keyed loop slot evaluates its Array default; a present one uses its own value.
// The from extraction stays within each iteration.
const out = [];
for (const {
  k: {
    from
  } = {
    from: _Array$from
  }
} of [{}, {
  k: Array
}]) (_pushMaybeArray(out) || 0).call(out, from([1]).length);
export { out };