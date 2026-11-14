import _entries from "@core-js/pure/actual/instance/entries";
import _Object$entries from "@core-js/pure/actual/object/entries";
// An open slot selects its own instance method or the receiver default's static.
const source = Function('return { list: [3] }')();
const {
    list: _ref = Object
  } = source,
  entries = _ref === Object ? _Object$entries : _entries(_ref);
use(entries.call(source.list).next().value);