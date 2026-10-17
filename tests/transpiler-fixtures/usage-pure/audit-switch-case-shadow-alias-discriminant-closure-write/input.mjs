// a write buried in a DISCRIMINANT closure may run (the callee is unknown) and per spec targets
// the OUTER binding - the resolution must bail even though a case-level lexical shadows the name
export function discriminantClosureWrite(mk) {
  let W = Map;
  switch (mk(() => { W = mk(); })) {
    case 1:
      let W = 0;
      mk(W);
  }
  return W.groupBy([1, 2], x => x % 2);
}
