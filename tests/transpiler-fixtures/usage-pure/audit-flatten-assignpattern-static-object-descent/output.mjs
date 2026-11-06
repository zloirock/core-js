import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// A literal namespace keeps its native entries read and dead inner receiver default.
// The known result type still narrows the later includes call.
const wrapper = {
  ns: Object
};
const {
  ns: {
    entries
  } = {}
} = wrapper;
const arr = entries({
  k: 1
});
_includesMaybeArray(arr).call(arr, ['k', 1]);