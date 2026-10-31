import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$keys from "@core-js/pure/actual/object/keys";
// A selected realm supplies a static value's instance members before a later parameter reads them.
// A supplied receiver keeps its own members and bypasses the selected default.
export function read({
  Object: {
    keys: {
      name
    },
    entries
  }
} = flag ? {
  Object: {
    keys: {
      name: _nameMaybeFunction(_Object$keys)
    },
    entries: _Object$entries
  }
} : own, after = name) {
  return [name, entries, after];
}