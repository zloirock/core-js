// negatives
export function oneArmIsNotTheRealm(flag) {
  if (flag) { var N = globalThis; } else { var N = {}; }
  return N.Array.of(3);
}
