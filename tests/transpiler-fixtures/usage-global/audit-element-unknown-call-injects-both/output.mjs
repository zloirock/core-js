import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// usage-global twin of the unknown-call retype bail: a method the registry does not know
// may be any mutator at runtime, so the read widens and injects BOTH families
const custom = [[1], [2]];
custom.custom();
export const viaUnknownCall = custom[0].at(0);