// ONE realm hop, one name: the dotted key, the string-literal computed key and a key BOUND to a
// constant string all name the same slot, so the run lands the same way whichever the source wrote
// NEGATIVE: an EFFECT-bearing key is a hop the landing may not take - the effects would go with it
// and the landing carries no slot to replay them in
// NEGATIVE: a hop standing TERMINAL is the value the source reads and keeps its slot, again under
// every spelling the canon can name
const bk = 'window';
let c = 0, w;
export const dottedHop = (w = globalThis.self.window.Array)?.from([]);
export const literalKeyHop = (w = globalThis.self['window'].Array)?.from([]);
export const boundKeyHop = (w = globalThis.self[bk].Array)?.from([]);
export const effectKeyHopKeeps = (w = globalThis.self[(c++, 'window')].Array)?.from([]);
export const terminalDottedKeeps = globalThis.self.window;
export const terminalLiteralKeyKeeps = globalThis.self['window'];
export const terminalBoundKeyKeeps = globalThis.self[bk];
export { c, w };
