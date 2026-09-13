// A kept optional host guards a synthesized argument and its key effects. An unresolved
// sibling uses one memo; prefixes precede the probe, and fallback effects stay conditional.
let hits = 0;
let full;
export const of = (({ of } = {}) => of)((full = globalThis.window)?.[(hits++, 'self')].Array ?? {});
let partial;
export const from = (({ from, customZ } = {}) => [from, customZ])((partial = globalThis.window)?.[(hits++, 'self')].Array ?? {});
let prefixed;
export const values = (({ values } = {}) => values)(
  (hits += 10, prefixed = globalThis.window)?.[(hits++, 'self')].Object || (hits += 100, {}),
);
export { hits };
