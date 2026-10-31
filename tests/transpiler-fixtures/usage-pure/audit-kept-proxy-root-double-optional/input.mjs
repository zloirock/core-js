// Quiet optional realm hops retain their existing fold. Effectful keys and optional calls stay live.
// Ordinary optional instance calls keep their own receiver guards.
export const bareDoubleOptional = globalThis.window?.self?.self.Array.prototype.flat.call([2, [3]]);
let oc = 0;
let cb;
export const optionalCallHop = () => (cb = globalThis.window)?.[(oc++, 'self')]?.().Array;
export { oc };
let c3 = 0;
const galias = globalThis;
let alk;
export const aliasDoubleOptional = (alk = galias.window)?.self?.[(c3++, 'self')].Array.prototype.at.call([7], 0);
export { c3 };
const holder = { p: { q: [4, [5]] } };
export const ordinaryDoubleOptional = holder.p?.q?.findLastIndex(v => Array.isArray(v));
