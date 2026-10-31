import _globalThis from "@core-js/pure/actual/global-this";
import _entries from "@core-js/pure/actual/instance/entries";
import _Object$entries from "@core-js/pure/actual/object/entries";
{
  for (const _ref2 of [{
    w: Object
  }, _globalThis]) {
    const {
        w: _ref
      } = _ref2,
      entries = _ref === Object ? _Object$entries : _entries(_ref);
    entries;
  }
}