// Declaration kinds and neighboring declarators retain source order for nested extraction.
var { [Symbol.iterator]: { next: varNext = [1].with(0, 2) }, fifth } = [10, 11];
export const viaVarKind = [varNext, fifth];
