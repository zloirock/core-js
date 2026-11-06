// When every arm assigns the realm, the alias permits a direct static fold.
// Mixed or missing arms and shadowed realm names provide only candidates: pure keeps
// the constructor read behind an identity guard. A later overwrite prevents direct
// folding too. Distinct static methods keep these decisions independently observable.
export function bothArmsName(flag) {
  if (flag) { var G = globalThis; } else { var G = self; }
  return G.Array.from([2]);
}
