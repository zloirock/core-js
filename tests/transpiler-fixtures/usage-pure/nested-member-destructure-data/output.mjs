import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// Destructuring named data keys off a nested literal preserves its types for every reader.
const wrap = {
  box: {
    data: [1, 2]
  }
};
const {
  data
} = wrap.box;
export const at = _atMaybeArray(wrap.box.data);
const other = {
  Box: {
    Text: 'abc'
  }
};
export const includes = _includesMaybeString(other.Box.Text);