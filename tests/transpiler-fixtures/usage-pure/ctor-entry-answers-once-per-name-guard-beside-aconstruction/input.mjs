export function guardBesideAConstruction(mk) {
  let W = Map;
  switch (mk(() => { W = mk(); })) {
    case 1:
      let W = 0;
      mk(W);
  }
  mk(W);
  return [W.groupBy([1], x => x), new Map()];
}
