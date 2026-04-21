// indexed access T[number] on user alias that resolves to array/tuple.
// tests resolveElementType path through followTypeAliasChain.
type Items = string[];
declare const a: Items[number];
a.at(0);
a.includes('x');
