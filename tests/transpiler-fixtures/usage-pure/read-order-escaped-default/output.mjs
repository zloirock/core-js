import _Object$entries from "@core-js/pure/actual/object/entries";
// An escaped slot may supply an instance instead of taking the static default.
let r;
const src = {};
const fill = Function("o", "o.list = [1, 2]");
fill(src);
const {
  list: {
    entries
  } = {
    entries: _Object$entries
  }
} = src;
r = entries.call(src.list).next().value;
use(r);