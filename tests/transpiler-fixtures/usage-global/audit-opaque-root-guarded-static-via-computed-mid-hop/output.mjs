import "core-js/modules/es.array.at";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// a CONST-bound computed hop key resolves like the dotted spelling - the nested test guards
// the window prefix and the branch reads the ponyfill leaf
const ck = () => globalThis;
const hopKey = 'self';
export const viaComputedMidHop = ck()?.window?.[hopKey]?.Array.of(16).at(0);