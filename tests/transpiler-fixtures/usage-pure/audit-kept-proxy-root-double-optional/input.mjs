// two optionals over a proxy root: only the one reading the environment probe keeps a test, and a
// dead `?.` past `self` folds with no memo - also through an alias-carried store, where one memo at the
// root holds the probe and the keys migrate. an optional CALL between the hops ends the fold: the probe
// keeps its guard and the key's effect runs only where native runs it. NEGATIVE: an ordinary
// double-optional chain keeps its leaf-nearest memo, the inner `?.` living inside the memoized value.
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
