import _entries from "@core-js/pure/actual/instance/entries";
import _Object$entries from "@core-js/pure/actual/object/entries";
// The selected value needs its static entry or instance dispatch.
// Preserve the user branch and evaluate every key and receiver once.
for (const _ref of [flag ? Object : user]) {
  let entries = _ref === Object ? _Object$entries : _entries(_ref);
  consume(entries);
}