import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// the nested-param mirror descends a proxy HOP only while that hop still stands for the pristine
// realm: a slot the user replaced holds the replacement, so the hop's subtree becomes a
// passthrough reading the live value while the untouched sibling keeps its synthesized ponyfill
_globalThis.window = fake;
function read({
  window: {
    Array: {
      from
    }
  },
  Array: {
    of
  }
} = {
  window: {
    Array: _globalThis.window.Array
  },
  Array: {
    of: _Array$of
  }
}) {
  return [from, of];
}
read();