import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise from "@core-js/pure/actual/promise/constructor";
// boundaries: these writes target the OUTER binding and must keep bailing the resolution
export function noShadowRealWrite(cond, mk) {
  let Q = _Promise;
  switch (cond) {
    case 1:
      Q = mk();
  }
  return (Q === _Promise ? _Promise$allSettled : Q.allSettled.bind(Q))([1]);
}