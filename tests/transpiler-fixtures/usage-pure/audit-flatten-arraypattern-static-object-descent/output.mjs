import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// An array containing a literal namespace keeps its native Object.entries read.
// Its known result type still selects the array at helper.
const wrapper = {
  ns: Object
};
const [{
  ns: {
    entries
  }
}] = [wrapper];
const arr = entries({
  k: 1
});
_atMaybeArray(arr).call(arr, 0);