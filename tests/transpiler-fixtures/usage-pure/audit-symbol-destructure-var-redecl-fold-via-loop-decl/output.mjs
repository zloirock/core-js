import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
var iterator = _Symbol$iterator;
function loopDecl() {
  while (Math.random() > 2) {
    var iterator = _Symbol$iterator;
  }
  return [][iterator];
}
export const viaLoopDecl = loopDecl();