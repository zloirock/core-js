import "core-js/modules/es.array.at";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// a CHAIN-ASSIGN wrapper around the proven call root rides the nested test verbatim - the
// write runs exactly once, the branch reads the ponyfill leaf
let heldRoot;
const ca2 = () => globalThis;
export const viaChainAssignSwap = (heldRoot = ca2())?.window?.self?.Array.of(15).at(0);