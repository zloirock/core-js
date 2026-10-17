// a CONDITIONAL post-capture flip cannot reach the captured binding either - still folds
let kp = 'Symbol';
const { [kp]: CondFlipSymbol } = globalThis;
if (cond) kp = 'Array';
const { iterator: viaCondFlip = fb } = CondFlipSymbol;
export const q = [29, 30][viaCondFlip];
