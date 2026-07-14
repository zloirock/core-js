import "core-js/modules/es.array.at";
import "core-js/modules/es.array.fill";
import "core-js/modules/es.string.at";
// usage-global twin of the optional-chained mutator bail: the optional spelling
// invalidates element precision the same way, so the read injects BOTH families
const filled = [[1], [2]];
filled?.fill(["x"]);
export const viaOptionalMutator = filled[0].at(2);