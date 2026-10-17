import _Object$keys from "@core-js/pure/actual/object/keys";
// NEGATIVE: a namespaced tag name binds nothing - both parts are literals.
export const namespacedNotRef = function L({
  ['keys']: keys
} = {
  ['keys']: _Object$keys
}) {
  return <ns:L x={1}>{keys({
      a: 1
    }).length}</ns:L>;
}();