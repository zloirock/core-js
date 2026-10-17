// NEGATIVE: a namespaced tag name binds nothing - both parts are literals.
export const namespacedNotRef = (function L({ ['keys']: keys } = Object) {
  return <ns:L x={1}>{keys({ a: 1 }).length}</ns:L>;
})();
