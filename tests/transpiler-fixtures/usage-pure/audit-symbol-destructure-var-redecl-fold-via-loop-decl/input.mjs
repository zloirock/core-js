var { iterator } = Symbol;
function loopDecl() {
  while (Math.random() > 2) { var { iterator } = Symbol; }
  return [][iterator];
}
export const viaLoopDecl = loopDecl();
