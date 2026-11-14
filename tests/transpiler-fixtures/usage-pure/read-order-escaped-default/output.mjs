import _entries from "@core-js/pure/actual/instance/entries";
import _Object$entries from "@core-js/pure/actual/object/entries";
// An escaped slot may supply an instance instead of taking the static default.
let r;
const src = {};
const fill = Function("o", "o.list = [1, 2]");
fill(src);
const {
    list: _ref = Object
  } = src,
  entries = _ref === Object ? _Object$entries : _entries(_ref);
r = entries.call(src.list).next().value;
use(r);