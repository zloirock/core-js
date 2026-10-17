export function proxyHopWrite(mk) {
  let W = globalThis.Set;
  switch (mk(() => { W = mk(); })) {
    case 1:
      let W = 0;
      mk(W);
  }
  mk(W);
  return [W, new Set()];
}
