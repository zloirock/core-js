// A computed string key selects the known constructor slot for a direct static read.
const memberComputedStringKey = (function () {
  const computedHolder = { k: Object };
  return computedHolder['k'].getOwnPropertyNames({});
})();
export { memberComputedStringKey };
