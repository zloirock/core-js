import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
// A bare non-null assertion erases without ending the optional chain or moving its effects.
export function read(choice) {
  const effects = [];
  let w: any = _globalThis;
  if (choice) w = null;
  return null == w ? void 0 : (w === _globalThis ? _Map : w.Map).groupBy([1], (x: number) => x).size;
}