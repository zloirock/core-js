// element precision recurses through nested literal layers
const nested = [[[1]], [[2]]];
export const viaNestedRead = nested[0][0].includes(1);
