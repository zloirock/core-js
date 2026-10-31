let n = 0;
function pf() {
  n++;
  return globalThis;
}
const { resolve } = pf().self.Promise;
export const p = [typeof resolve, n];
