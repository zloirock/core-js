let z = 0;
function nf() {
  z++;
  return globalThis;
}
const { asyncIterator } = nf().self[(z++, 'Symbol')];

export const i = [typeof asyncIterator, z];
