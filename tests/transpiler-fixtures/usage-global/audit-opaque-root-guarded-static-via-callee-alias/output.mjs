import "core-js/modules/es.array.at";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// an ALIAS of the provable callee follows transitively (identifier hops re-anchor at their
// own declaration scope), so the aliased call proves like the direct one
const mkRoot = () => globalThis;
const aliasedMk = mkRoot;
export const viaCalleeAlias = aliasedMk()?.window?.self?.Array.of(32).at(0);