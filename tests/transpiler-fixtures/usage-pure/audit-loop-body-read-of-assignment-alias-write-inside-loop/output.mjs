import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
export function writeInsideLoop(c, other) {
  let y = _globalThis;
  while (c()) {
    (y === _globalThis ? _Map : y.Map).groupBy([1], v => v);
    y = other;
  }
}