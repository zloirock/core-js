import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Object$entries from "@core-js/pure/actual/object/entries";
// ArrayPattern peel + static-object descent. wrapper holds an ObjectExpression with `.ns`
// pointing at the Object constructor; destructure indexes ArrayPattern[0] (which classifier
// peels via arrayIndex tracking) and walks ns -> entries to resolve Object.entries
const wrapper = {
  ns: Object
};
const entries = _Object$entries;
const arr = entries({
  k: 1
});
_atMaybeArray(arr).call(arr, 0);