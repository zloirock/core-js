import _Array$from from "@core-js/pure/actual/array/from";
import _self from "@core-js/pure/actual/self";
// Dotted, literal and constant-bound realm keys name the same slot and land alike.
// A plain middle hop collapses with its backed receiver; a computed-key effect runs
// once before the stored value lands. Terminal environment-probe values retain
// their slots under every key spelling.
const bk = 'window';
let c = 0,
  w;
export const dottedHop = (w = _self.Array, _Array$from)([]);
export const literalKeyHop = (w = _self.Array, _Array$from)([]);
export const boundKeyHop = (w = _self.Array, _Array$from)([]);
export const effectKeyHopKeeps = (w = (c++, _self).Array, _Array$from)([]);
export const terminalDottedKeeps = _self.window;
export const terminalLiteralKeyKeeps = _self['window'];
export const terminalBoundKeyKeeps = _self[bk];
export { c, w };