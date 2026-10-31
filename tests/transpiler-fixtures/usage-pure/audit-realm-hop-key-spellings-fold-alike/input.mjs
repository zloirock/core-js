// Dotted, literal and bound quiet realm keys land alike; terminal probes keep their slots.
// An effectful realm key retains its source read and store.
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
