// A string-spelled instance key reads the array receiver selected through an object member.
const memberChainReceiverStringKey = (function () {
  const chainHost = { arr: [5, 6] };
  const { 'findLast': fl } = chainHost.arr;
  return fl;
})();
export { memberChainReceiverStringKey };
