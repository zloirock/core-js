import "core-js/modules/es.array.at";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// an SE-PREFIXED computed hop key still RESOLVES for the guard count (the effect stays live in
// the kept test text, in source order after the window test) - the branch reads the ponyfill
// leaf. the key parens spelling differs cosmetically between emitters
let keyEff = 0;
const sk = () => globalThis;
export const viaSeComputedOwnKey = sk()?.window?.[keyEff++, 'self']?.Array.of(19).at(0);