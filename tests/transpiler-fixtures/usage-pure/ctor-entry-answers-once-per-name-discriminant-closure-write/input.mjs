// All references to one constructor share one ponyfill binding. A constructor identity guard compares against the same entry that
// escaping references and writes use.
export function discriminantClosureWrite(mk) {
  let W = Map;
  switch (mk(() => { W = mk(); })) {
    case 1:
      let W = 0;
      mk(W);
  }
  mk(W);
  return W.groupBy([1, 2], x => x % 2);
}
