// The consumer receives a new array containing the original elements.
const fanned = [[1], [2]];
use([...fanned]);
export const viaSpreadEscape = fanned[0].includes(8);
