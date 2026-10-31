// a method the registry does not know may be any mutator at runtime, so it bails too
const custom = [[1], [2]];
custom.custom();
export const viaUnknownCall = custom[0].includes(3);
