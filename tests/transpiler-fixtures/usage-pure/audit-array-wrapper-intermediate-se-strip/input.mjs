// an SE buried at an INTERMEDIATE array-wrapper level lifts exactly once and the consumed
// wrapper level is stripped from the residual (`[(se(), [g])]` -> residual reads `[[_g]]`)
let mid = 0;
function midEffect() { mid++; }
const [[{ Array: { from }, keep }]] = [(midEffect(), [globalThis])];
// single-level control: the prefix lifts and the consumed wrapper strips the same way
let e1 = 0;
const [{ Array: { of }, tail }] = (e1++, [globalThis]);
export const r = [from, of, keep, tail, mid, e1];
