import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// A loop initializer keeps its sequence prefix once inside the header.
// The nested static always receives its pure method before the loop body reads it.
function se() {
  return _globalThis;
}
for (const {
  Array: {
    from
  }
} = (se(), {
  Array: {
    from: _Array$from
  }
}); false;) from([]);