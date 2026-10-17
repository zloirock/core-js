// NEGATIVE: an indeterminable dominating VALUE (conditional expression) never resolves -
// the whole chain stays raw (a wrong-value fold would substitute the wrong slot)
let kv = 'Symbol';
kv = cond ? 'Symbol' : 'Array';
const { [kv]: CondValueSymbol } = globalThis;
const { iterator: viaCondValue = fb } = CondValueSymbol;
export const m = [23, 24][viaCondValue];
