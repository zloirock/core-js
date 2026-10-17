import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
export function viaSeq(c) {
  let P;
  if (c) P = _Promise;
  return (0, P === _Promise ? _Promise$try : P.try)(() => 1);
}
export const r = [viaSeq(true)];