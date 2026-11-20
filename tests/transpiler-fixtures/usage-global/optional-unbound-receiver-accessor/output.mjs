import "core-js/modules/es.array.at";
import "core-js/modules/es.array.find-last";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.string.at";
// Each optional read of an unbound receiver needs its own method family in usage-global.
export const value = rows?.at?.(0);
export const method = rows?.findLast;
export const sealed = (rows?.flat)(0);