import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// Quiet literal and bound keys name the same realm value.
// Effectful realm keys retain their native value and navigation reads.
let hits = 0;
const key = 'self';
export const viaPlainKey = _self;
export const viaLiteralKey = _self;
export const viaVariableKey = _self;
export const viaEffectKey = _globalThis[hits++, 'self'];
export const viaPlainKeyNavigated = _self.Array;
export const viaEffectKeyNavigated = _globalThis[hits++, 'self'].Array;
export { hits };