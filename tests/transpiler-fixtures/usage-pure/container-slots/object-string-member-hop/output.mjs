import _Object$getOwnPropertyNames from "@core-js/pure/actual/object/get-own-property-names";
// A computed string key selects the known constructor slot for a direct static read.
const memberComputedStringKey = function () {
  const computedHolder = {
    k: Object
  };
  return _Object$getOwnPropertyNames({});
}();
export { memberComputedStringKey };