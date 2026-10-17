import _globalThis from "@core-js/pure/actual/global-this";
export function literalHop(flag) {
  if (flag) {
    var G = _globalThis;
  }
  const {
    w: {
      Array: {
        from
      }
    }
  } = {
    w: G
  };
  return from([5]);
}