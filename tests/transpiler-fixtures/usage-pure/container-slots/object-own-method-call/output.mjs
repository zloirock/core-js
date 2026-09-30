import _Object$getOwnPropertyNames from "@core-js/pure/actual/object/get-own-property-names";
// An own method call on the container leaves its independent constructor slot available.
const selfMethodCallLeaksNothing = function () {
  const selfCall = {
    k: Object,
    ping() {
      return 1;
    }
  };
  selfCall.ping();
  const {
    k: {
      getOwnPropertyNames
    }
  } = {
    k: {
      getOwnPropertyNames: _Object$getOwnPropertyNames
    }
  };
  return getOwnPropertyNames;
}();
export { selfMethodCallLeaksNothing };