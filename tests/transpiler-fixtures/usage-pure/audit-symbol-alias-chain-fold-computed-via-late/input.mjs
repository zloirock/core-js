// NEGATIVE: the consumer READS the alias before the aliasing write runs - the capture holds
// undefined and throws natively; a fold would silently rescue it
let LateSymbol;
const { iterator: viaLate = fb } = LateSymbol;
({ Symbol: LateSymbol } = globalThis);
export const z = [41, 42][viaLate];
