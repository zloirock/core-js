import "core-js/modules/es.array.at";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// an SE-carrying ARG of the identity root rides the kept test, exactly once, in source order
let idEff = 0;
export const viaIdentitySeArg = (x => x)((idEff++, globalThis))?.window?.self?.Array.of(25).at(0);