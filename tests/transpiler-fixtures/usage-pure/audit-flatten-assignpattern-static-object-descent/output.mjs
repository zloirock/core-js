import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _Object$entries from "@core-js/pure/actual/object/entries";
// A const-bound container supplies a static through an inner pattern default.
// The known constructor keeps that default dead.
const wrapper = {
  ns: Object
};
const {
  ns: {
    entries
  } = {}
} = {
  ns: {
    entries: _Object$entries
  }
};
const arr = entries({
  k: 1
});
_includesMaybeArray(arr).call(arr, ['k', 1]);