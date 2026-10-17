// Inner defaults replace their receiver whole where a mirror can carry its keys.
// Quoted keys retain native reads; declined rest and unknown supplied receivers stay native.
// Member targets and repeated flat keys retain the same mirror as ordinary bindings.
const getKey = () => 'Map';
export const keyed = (() => {
  const { k: { Set: KS, [getKey()]: y, Array: { of: kof } } = globalThis } = {};
  const { k: { Array: { of: only } } = globalThis } = {};
  return [KS, y, kof, only];
})();
