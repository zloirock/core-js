import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
let d = 0;
let out2;
for (const resolve = (d++, _Promise$resolve); d < 2;) {
  out2 = typeof resolve;
  d++;
}
export const r2 = [out2, d];