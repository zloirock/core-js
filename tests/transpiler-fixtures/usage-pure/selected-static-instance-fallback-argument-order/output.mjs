import _entries from "@core-js/pure/actual/instance/entries";
import _Object$entries from "@core-js/pure/actual/object/entries";
// A selected static keeps argument timing through its instance fallback.
export function read(receiver, argument) {
  const Ctor = receiver || Object;
  return _Object$entries.call.call(Ctor === Object ? _Object$entries : _entries(Ctor), Ctor, argument());
}