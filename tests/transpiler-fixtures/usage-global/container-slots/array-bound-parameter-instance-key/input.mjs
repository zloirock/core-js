// A const-bound computed key selects an instance method from an array parameter default.
const constBoundComputedInstanceKey = (function () {
  const KEY = 'flat';
  return (function ({ [KEY]: f } = [3, [4]]) { return f; })();
})();
export { constBoundComputedInstanceKey };
