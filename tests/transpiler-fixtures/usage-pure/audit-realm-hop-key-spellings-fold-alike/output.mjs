import _Array$from from "@core-js/pure/actual/array/from";
import _self from "@core-js/pure/actual/self";
// ONE realm hop, one name: the dotted key, the string-literal computed key and a key BOUND to a
// constant string all name the same slot, so the run lands the same way whichever the source wrote
// NEGATIVE: an EFFECT-bearing key is a hop the landing may not take - the effects would go with it
// and the landing carries no slot to replay them in
// NEGATIVE: a hop standing TERMINAL is the value the source reads and keeps its slot, again under
// every spelling the canon can name
const bk = 'window';
let c = 0,
  w;
export const dottedHop = null == (w = _self.Array) ? void 0 : _Array$from([]);
export const literalKeyHop = null == (w = _self.Array) ? void 0 : _Array$from([]);
export const boundKeyHop = null == (w = _self.Array) ? void 0 : _Array$from([]);
export const effectKeyHopKeeps = null == (w = _self[c++, 'window'].Array) ? void 0 : _Array$from([]);
export const terminalDottedKeeps = _self.window;
export const terminalLiteralKeyKeeps = _self['window'];
export const terminalBoundKeyKeeps = _self[bk];
export { c, w };