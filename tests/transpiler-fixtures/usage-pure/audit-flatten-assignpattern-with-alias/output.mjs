import _Array$from from "@core-js/pure/actual/array/from";
import _Object$entries from "@core-js/pure/actual/object/entries";
// AssignmentPattern wrapper + aliased local name (`from: myFrom`). Wrapper peel must
// preserve the user alias - extracted decl emits `const myFrom = _Array$from` not
// `const from = ...`. Distinct alias per line so per-prop classification is unambiguous
const myFrom = _Array$from;
const myEntries = _Object$entries;
myFrom('hi');
myEntries({
  k: 1
});