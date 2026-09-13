// The slot captured the realm's Array before entering the inner scope. Its uncertain
// read must compare against that constructor even when the local Array name holds Map.
function read(key) {
  const ns = { Q: Array, [key]: Map };
  return function capture(Array) {
    const { Q: { of: method } } = ns;
    return [method, Array];
  }(Map);
}
export const kinds = [typeof read('other')[0], typeof read('Q')[0]];
