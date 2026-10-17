// an optional-chained mutator call bails the same way as the plain spelling
const filled = [[1], [2]];
export const viaOptionalMutator = filled[0].at(2);
