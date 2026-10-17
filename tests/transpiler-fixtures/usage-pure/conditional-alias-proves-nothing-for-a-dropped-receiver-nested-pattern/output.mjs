import _globalThis from "@core-js/pure/actual/global-this";
// A CONDITIONALLY assigned alias holds the realm only on the paths through its branch: off them the name is the hoisted
// `undefined`, and reading a member off it THROWS.
export function nestedPattern(flag) {
  if (flag) {
    var G = _globalThis;
  }
  const {
    Array: {
      from
    }
  } = G;
  return from([2]);
}