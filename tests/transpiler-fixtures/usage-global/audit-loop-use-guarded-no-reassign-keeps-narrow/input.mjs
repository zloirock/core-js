// no reassignment in the loop body, so the guard's narrow holds across every iteration -
// .at stays String-only (the loop-carry bail must not fire without a back-edge mutation)
function process(x, cond) {
  if (typeof x !== "string") return;
  while (cond) {
    x.at(0);
  }
}
