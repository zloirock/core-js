import _Object$entries from "@core-js/pure/actual/object/entries";
// NEGATIVE: a member-expression TAIL is a prop on another binding, not a reference.
export const memberTailNotRef = function K({
  ['entries']: entries
} = {
  ['entries']: _Object$entries
}) {
  return <Other.K x={1}>{entries({
      a: 1
    }).length}</Other.K>;
}();