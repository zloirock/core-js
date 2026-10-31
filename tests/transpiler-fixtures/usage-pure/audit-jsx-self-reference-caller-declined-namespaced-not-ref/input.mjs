export const namespacedNotRef = (function L({ keys, ...rest } = Object) {
  return <ns:L x={1}>{keys(rest).length}</ns:L>;
})();
