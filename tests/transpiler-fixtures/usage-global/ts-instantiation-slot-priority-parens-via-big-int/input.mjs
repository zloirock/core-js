// the rest of the domain: shapes already binding tighter than the type-argument list stay bare,
// and `satisfies` is the fusing cast the lines above do not spell
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const viaBigInt = ((1n)<string>)(1);
