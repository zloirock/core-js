// Dotted, literal and constant-bound realm keys name the same slot and land alike.
// A plain middle hop collapses with its backed receiver; a computed-key effect runs
// once before the stored value lands. Terminal environment-probe values retain
// their slots under every key spelling.
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
