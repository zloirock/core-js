import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// An explicitly undefined keyed loop slot uses Array while a defined slot keeps its supplied value.
// Both routes preserve the served from claim.
const out = [];
for (const {
  k: {
    from
  } = {
    from: _Array$from
  }
} of [{
  k: undefined
}, {
  k: Array
}]) (_pushMaybeArray(out) || 0).call(out, from([1]).length);
export { out };