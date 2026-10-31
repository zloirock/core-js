import _Object$entries from "@core-js/pure/actual/object/entries";
// A TypeScript satisfies wrapper preserves the sequence effect before its static binding.
declare function recordCall(): void;
const {
  Object: {
    entries
  }
} = (recordCall(), {
  Object: {
    entries: _Object$entries
  }
}) satisfies any;
entries({
  a: 1
});