// the guard lives INSIDE the loop and re-narrows x every iteration, so even though x is
// reassigned after the use, the next iteration re-checks before reaching it - the narrow holds
// and .at stays String-only (the loop-carry bail must not fire when an inner guard re-narrows)
function process(getNext, cond) {
  let x = "init";
  while (cond) {
    if (typeof x !== "string") break;
    x.at(0);
    x = getNext();
  }
}
