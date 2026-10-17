// a spread hands every element out at once - the holder may write elements, so it bails
const fanned = [[1], [2]];
use([...fanned]);
export const viaSpreadEscape = fanned[0].includes(8);
