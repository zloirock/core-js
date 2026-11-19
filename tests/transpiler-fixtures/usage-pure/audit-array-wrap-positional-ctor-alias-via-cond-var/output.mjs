import _globalThis from "@core-js/pure/actual/global-this";
// A conditionally initialized var cannot promise a constructor on the untaken branch.
// Its native pattern and guarded later read remain intact.
function condVar(c) {
  if (c) {
    var [{
      Iterator: CB
    }] = [_globalThis];
  }
  return CB && CB.range(0, c);
}
export const viaCondVar = condVar(cond);