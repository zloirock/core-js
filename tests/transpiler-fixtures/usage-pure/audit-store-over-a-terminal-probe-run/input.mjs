// what a STORE spells over a terminal realm probe: the value it hands on IS the realm object, so
// the probe folds onto the ponyfill - through a seal, a dead sequence element and a proven call
// root alike. the one thing that stops the fold is an EFFECT inside the run: it has no slot in the
// folded value, so the collapse keeps its own spelling and the probe rides the ponyfill, exactly
// as the `delete` fold and the flat read do. every row is one spelling of the same entity, and
// they must all answer the same way
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
