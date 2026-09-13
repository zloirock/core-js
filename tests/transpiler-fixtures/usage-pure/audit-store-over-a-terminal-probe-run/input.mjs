// A stored terminal realm probe keeps the value of its final window read.
// Parentheses, dead sequence elements and proven call roots do not turn that probe
// into a backed realm value. Prefix and computed-key effects run once in source order.
let e = 0;
let stored;
function dh() {
  return globalThis;
}
export const plain = (stored = globalThis.self.window);
export const sealed = (stored = (globalThis.self).window);
export const deadSeq = (stored = (0, globalThis.self).window);
export const callRoot = (stored = dh().self.window);

// ... and the effect-carrying twins of the same four
export const prefixed = (stored = (e++, globalThis.self).window);
export const callPrefixed = (stored = (e++, dh()).self.window);
export const seKeyed = (stored = globalThis.self[(e++, 'window')]);
export { e, stored };
