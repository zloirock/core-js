import _Iterator from "@core-js/pure/actual/iterator/constructor";
function condVar(c) {
  if (c) {
    var [{
      Iterator: CB
    }] = [{
      Iterator: _Iterator
    }];
  }
  return CB && CB.range(0, c);
}
export const viaCondVar = condVar(cond);