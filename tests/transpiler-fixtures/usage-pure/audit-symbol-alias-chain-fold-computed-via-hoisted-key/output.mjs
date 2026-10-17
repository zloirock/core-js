import _globalThis from "@core-js/pure/actual/global-this";
// NEGATIVE: a capture BEFORE the hoisted declarator reads the pre-assignment undefined -
// the init's textual position must dominate the CAPTURE, which sits above it
const {
  [kv2]: HoistedKeySymbol
} = _globalThis;
var kv2 = 'Symbol';
const {
  iterator: viaHoistedKey = fb
} = HoistedKeySymbol;
export const v = [35, 36][viaHoistedKey];