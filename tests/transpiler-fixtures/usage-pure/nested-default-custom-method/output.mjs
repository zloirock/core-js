import _entries from "@core-js/pure/actual/instance/entries";
import _Object$entries from "@core-js/pure/actual/object/entries";
// A defaulted slot and its custom method getter each run once.
const source = {
  get list() {
    effect('list');
    return receiver;
  }
};
const {
    list: _ref = Object
  } = source,
  entries = _ref === Object ? _Object$entries : _entries(_ref);
use(entries.call(receiver));