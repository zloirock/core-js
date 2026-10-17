// NEGATIVE: a guarded aliasing write is flow-refused at registration - no fold
let GuardedSymbol;
if (cond) ({ Symbol: GuardedSymbol } = globalThis);
const { iterator: viaGuarded = fb } = GuardedSymbol;
export const ab = [45, 46][viaGuarded];
