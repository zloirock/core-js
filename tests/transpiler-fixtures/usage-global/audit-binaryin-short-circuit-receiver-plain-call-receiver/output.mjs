import "core-js/modules/es.array.at";
import "core-js/modules/es.array.slice";
import "core-js/modules/es.array.species";
// `in` folds to a constant only while its right operand cannot be the undefined that `in` THROWS on.
const src = [3, [1, 2]];
export const plainCallReceiver = 'at' in src.slice();