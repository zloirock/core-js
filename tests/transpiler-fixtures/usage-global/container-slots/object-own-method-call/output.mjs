import "core-js/modules/es.object.get-own-property-names";
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
  } = selfCall;
  return getOwnPropertyNames;
}();
export { selfMethodCallLeaksNothing };