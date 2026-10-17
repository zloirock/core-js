import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.self";
// When every arm assigns the realm, the alias permits a direct static fold.
// Mixed or missing arms and shadowed realm names provide only candidates: pure keeps
// the constructor read behind an identity guard. A later overwrite prevents direct
// folding too. Distinct static methods keep these decisions independently observable.
export function bothArmsName(flag) {
  if (flag) {
    var G = globalThis;
  } else {
    var G = self;
  }
  return G.Array.from([2]);
}