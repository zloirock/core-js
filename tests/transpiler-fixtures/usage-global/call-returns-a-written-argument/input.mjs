// Writes invalidate the returned container proof; named reads cover constructors from the arguments and writes.
// Closed calls do not expose their arguments. An unchanged argument resolves precisely.
function viaMember(box, key, value) { box[key] = value; return box; }
function viaBuiltin(box, key, value) { Object.defineProperty(box, key, { value: value, configurable: true }); return box; }
function viaAlias(box, key, value) { const alias = box; alias[key] = value; return box; }
function clean(box) { return box; }
export const declinedMember = viaMember({ M: Array }, 'M', Map).M.groupBy([1], x => x);
export const declinedBuiltin = viaBuiltin({ S: Array }, 'S', Set).S.union(new Set());
export const declinedAlias = viaAlias({ P: Array }, 'P', Promise).P.withResolvers();
export const resolved = clean({ A: Array }).A.of(2);
