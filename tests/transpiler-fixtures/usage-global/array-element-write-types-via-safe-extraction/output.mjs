import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
const lent = [[1], [2]];
use(lent.includes);
export const viaSafeExtraction = lent[0].at(-1);