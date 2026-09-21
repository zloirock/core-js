import "core-js/modules/es.array.at";
// The imported index supplies all; the computed key still needs its own array polyfill.
import P from "@core-js/pure/actual/promise";
export const all = P[[1].at(0), "all"];