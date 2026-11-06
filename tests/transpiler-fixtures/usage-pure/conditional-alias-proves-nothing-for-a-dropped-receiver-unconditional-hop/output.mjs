import _globalThis from "@core-js/pure/actual/global-this";
// An unconditional realm alias inside a literal wrapper keeps native nested static reads.
// Only the realm reference itself is replaced.
export function unconditionalHop() {
  var G = _globalThis;
  const {
    w: {
      Object: {
        values
      }
    }
  } = {
    w: G
  };
  return values({
    b: 2
  });
}