import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// Shared capture and receiver-default routes preserve independently supported claims.
// Supplied values and defaults keep their source branches and independent claims. Instance claims retain their own receivers.
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