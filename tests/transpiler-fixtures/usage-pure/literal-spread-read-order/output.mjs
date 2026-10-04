import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// Spread getters finish constructing the receiver before the pattern writes a binding.
// The static under the final known slot remains polyfilled beside the spread.
const log = [];
const extra = {
  get value() {
    _pushMaybeArray(log).call(log, typeof from);
    return 7;
  }
};
let from = 'old',
  value;
({
  Array: {
    from
  },
  value
} = {
  ...extra,
  Array: {
    from: _Array$from
  }
});
export { from, value, log };