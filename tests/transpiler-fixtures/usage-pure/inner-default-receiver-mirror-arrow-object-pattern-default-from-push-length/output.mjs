import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// An inner parameter default selects Array only when its keyed slot is absent.
// The served from leaf preserves both supplied and defaulted receiver paths.
const out = [];
(({
  k: {
    from
  } = {
    from: _Array$from
  }
}) => (_pushMaybeArray(out) || 0).call(out, from([1]).length))({
  k: Array
});
export { out };