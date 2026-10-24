import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// A sole nested assignment claim owns one read of its member root, just like a declaration.
const wrap = {
  box: {
    data: [1, 2]
  }
};
let at;
at = _atMaybeArray(wrap.box.data);
const other = {
  Box: {
    Inner: {
      Text: 'abc'
    }
  }
};
let includes;
includes = _includes(other.Box.Inner.Text);