let d = 0;
let out2;
for (const { resolve } = globalThis[(d++, 'self')].Promise; d < 2;) {
  out2 = typeof resolve;
  d++;
}
export const r2 = [out2, d];
