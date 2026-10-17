// NEGATIVE: a write inside a HOISTED closure called before the capture may run before the
// read - a textual after-position proves nothing across the function boundary, so bail
let kh = 'Symbol';
const { [kh]: HoistedFlip } = globalThis;
const { iterator: viaHoistedFlip = fb } = HoistedFlip;
export const t = [31, 32][viaHoistedFlip];
function flipKey() { kh = 'Array'; }
