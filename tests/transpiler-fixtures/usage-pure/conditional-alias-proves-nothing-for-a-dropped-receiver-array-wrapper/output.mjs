import _globalThis from "@core-js/pure/actual/global-this";
export function arrayWrapper(flag) {
  if (flag) {
    var G = _globalThis;
  }
  const [{
    Array: {
      from
    }
  }] = [G];
  return from([4]);
}