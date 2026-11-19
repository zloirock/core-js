import _Object$entries from "@core-js/pure/actual/object/entries";
// A pristine missing slot still proves its receiver default will run.
let r;
const src = {};
const {
  list: {
    entries
  } = {
    entries: _Object$entries
  }
} = src;
r = entries({
  a: 1
});
use(r);