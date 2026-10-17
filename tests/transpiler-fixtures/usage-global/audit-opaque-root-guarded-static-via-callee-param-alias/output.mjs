import "core-js/modules/es.array.at";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.at";
// NEGATIVE: an alias of a PARAM-bound callee is an arbitrary caller value - the chain keeps
// the raw guarded read
const mkRoot = () => globalThis;
export function viaCalleeParamAlias(mkRoot) {
  const inner = mkRoot;
  return inner()?.window?.self?.Array.of(33).at(0);
}