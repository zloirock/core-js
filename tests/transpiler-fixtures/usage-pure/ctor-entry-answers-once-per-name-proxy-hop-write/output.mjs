import _Set from "@core-js/pure/actual/set";
export function proxyHopWrite(mk) {
  let W = _Set;
  switch (mk(() => {
    W = mk();
  })) {
    case 1:
      let W = 0;
      mk(W);
  }
  mk(W);
  return [W, new _Set()];
}