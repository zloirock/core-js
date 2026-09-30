import "core-js/modules/es.object.entries";
// A container passed to a local read-only callee is subsequently read through its constructor slot.
const readOnlyCalleeStillBails = function () {
  function onlyReads(t) {
    return t.k;
  }
  const readOnlyEscape = {
    k: Object
  };
  onlyReads(readOnlyEscape);
  const {
    k: {
      entries
    }
  } = readOnlyEscape;
  return entries;
}();
export { readOnlyCalleeStillBails };