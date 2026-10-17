import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise from "@core-js/pure/actual/promise/constructor";
// dynamic init: no pairing evidence at all - the live slot's static read is guarded against the
// default's candidate, the default is mirrored
const [d0, {
  Promise: P
} = {
  Promise: _Promise
}] = dyn;
export const viaDynamicInit = (P === _Promise ? _Promise$allSettled : P.allSettled.bind(P))([]);