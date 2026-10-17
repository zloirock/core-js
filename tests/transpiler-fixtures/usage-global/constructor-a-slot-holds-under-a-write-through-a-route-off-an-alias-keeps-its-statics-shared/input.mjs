const registry = { C: Symbol };
const known = registry;
const kept = {};
const elsewhere = flag ? known : kept;
elsewhere.D = userValue;
export const shared = registry.C.for('a');
