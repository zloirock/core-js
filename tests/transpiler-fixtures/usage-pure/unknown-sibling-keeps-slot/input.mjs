// An unknown later key may replace the named Array slot with Map. The possible Array
// static still needs its polyfill, while a read from the overriding value stays intact.
function read(key) {
  const ns = { Q: Array, [key]: Map };
  const { Q: { of: method } } = ns;
  return method;
}
export const kinds = [typeof read('other'), typeof read('Q')];
