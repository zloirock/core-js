import _entries from "@core-js/pure/actual/instance/entries";
import _Object$entries from "@core-js/pure/actual/object/entries";
// A written slot no longer proves its receiver default will run.
let r;
const src = {};
src.list = [1, 2];
const {
    list: _ref = Object
  } = src,
  entries = _ref === Object ? _Object$entries : _entries(_ref);
r = entries.call(src.list).next().value;
use(r);