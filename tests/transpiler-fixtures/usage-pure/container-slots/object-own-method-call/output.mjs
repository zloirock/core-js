// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live.
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