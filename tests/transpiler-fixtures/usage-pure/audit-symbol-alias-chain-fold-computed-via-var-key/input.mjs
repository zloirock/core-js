// an unconditional top-level `var` key dominates the capture like a `const` - folds
var kw = 'Symbol';
const { [kw]: VarKeySymbol } = globalThis;
const { iterator: viaVarKey = fb } = VarKeySymbol;
export const w = [37, 38][viaVarKey];
