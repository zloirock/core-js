// the rest of the domain: shapes already binding tighter than the type-argument list stay bare,
// and `satisfies` is the fusing cast the lines above do not spell
const viaBigInt = ((1n)<any>)(1);
export const r = [viaBigInt];
