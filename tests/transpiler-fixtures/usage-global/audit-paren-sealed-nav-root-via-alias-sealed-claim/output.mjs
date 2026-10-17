import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
const gAlias = globalThis;
export const viaAliasSealedClaim = (gAlias.window?.self).Array.of(3);