import _Array$from from "@core-js/pure/actual/array/from";
import _self from "@core-js/pure/actual/self";
// Dotted, literal and bound quiet realm keys land alike; terminal probes keep their slots.
// An effectful realm key retains its source read and store.
const bk = 'window';
let c = 0,
  w;
export const dottedHop = (w = _self.Array, _Array$from)([]);
export const literalKeyHop = (w = _self.Array, _Array$from)([]);
export const boundKeyHop = (w = _self.Array, _Array$from)([]);
export const effectKeyHopKeeps = (w = _self[c++, 'window'].Array)?.from([]);
export const terminalDottedKeeps = _self.window;
export const terminalLiteralKeyKeeps = _self['window'];
export const terminalBoundKeyKeeps = _self[bk];
export { c, w };