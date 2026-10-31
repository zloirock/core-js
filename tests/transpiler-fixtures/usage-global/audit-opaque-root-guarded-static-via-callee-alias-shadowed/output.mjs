import "core-js/modules/es.array.at";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// an ALIAS of the provable callee follows transitively (identifier hops re-anchor at their
// own declaration scope), so the aliased call proves like the direct one
const mkRoot = () => globalThis;
const aliasedMk = mkRoot;
// the callee alias still proves under a same-name param SHADOW of the source binding - the
// alias holds the module-level arrow, the shadow never feeds it
export function viaCalleeAliasShadowed(mkRoot) {
  return aliasedMk()?.window?.self?.Array.of(34).at(0);
}