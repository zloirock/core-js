import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// The guarded receiver retains deletion and all live key or sibling claims.
export function read(choice) {
  var _ref;
  const effects = [];
  return _ref = choice ? Object : null, null == _ref ? true : delete (_ref === Object ? _Object$fromEntries([]) : _ref.fromEntries?.([]));
}