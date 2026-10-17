import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise";
export function conditionalWrite(c) {
  let z;
  if (c()) z = _globalThis;
  while (z) {
    return (z === _globalThis ? _Promise : z.Promise).allSettled([]);
  }
}