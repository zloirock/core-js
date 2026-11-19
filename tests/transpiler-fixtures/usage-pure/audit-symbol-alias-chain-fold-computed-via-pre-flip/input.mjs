// the inverse flip: the capture reads the init 'Symbol'; the later same-scope write cannot
// reach the captured binding, so the chain still folds to the pure constructor
let kf = 'Symbol';
const { [kf]: PreFlipSymbol } = globalThis;
kf = 'Array';
const { iterator: viaPreFlip = fb } = PreFlipSymbol;
export const o = [27, 28][viaPreFlip];
