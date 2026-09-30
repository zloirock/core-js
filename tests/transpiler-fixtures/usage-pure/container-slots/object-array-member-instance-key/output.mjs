import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
// A string-spelled instance key reads the array receiver selected through an object member.
const memberChainReceiverStringKey = function () {
  const chainHost = {
    arr: [5, 6]
  };
  const fl = _findLastMaybeArray(chainHost.arr);
  return fl;
}();
export { memberChainReceiverStringKey };