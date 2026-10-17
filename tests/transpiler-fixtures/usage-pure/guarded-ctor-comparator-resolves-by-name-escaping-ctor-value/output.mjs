import _Promise from "@core-js/pure/actual/promise";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
export function escapingCtorValue(c, sink) {
  let P;
  if (c) P = _Promise;
  sink(P);
  return P === _Promise ? _Promise$allSettled : P.allSettled;
}