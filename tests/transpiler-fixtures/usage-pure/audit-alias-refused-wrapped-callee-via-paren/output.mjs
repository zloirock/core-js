import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise from "@core-js/pure/actual/promise/constructor";
export function viaParen(c) {
  let P2;
  if (c) P2 = _Promise;
  return (P2 === _Promise ? _Promise$allSettled : P2.allSettled.bind(P2))([1, 2]);
}
export const r = [viaParen(true)];