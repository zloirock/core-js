// the reachable-key union is a usage-global mechanism: usage-pure bails on any reassigned
// alias (a substitution could not follow the runtime branch), so the same shape stays
// untouched with no imports - native semantics preserved
let k = 'at';
if (c) k = 'flat';
const arr = [1, 2];
export const r = arr[k];
