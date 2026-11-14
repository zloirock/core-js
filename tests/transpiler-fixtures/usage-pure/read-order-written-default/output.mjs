import _Object$entries from "@core-js/pure/actual/object/entries";
// A written slot no longer proves its receiver default will run.
let r;
const src = {};
src.list = [1, 2];
const {
  list: {
    entries
  } = {
    entries: _Object$entries
  }
} = src;
r = entries.call(src.list).next().value;
use(r);