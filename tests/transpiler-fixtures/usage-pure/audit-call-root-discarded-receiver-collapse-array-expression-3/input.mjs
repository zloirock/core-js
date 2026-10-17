let k = 0;
function af() {
  k++;
  return globalThis;
}
const { from } = af().self[(k++, 'Array')];
export const a = [typeof from, k];
