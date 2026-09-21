// A callee hands its CONTAINER argument back unchanged only where the parameter reached the return
// and nothing else: a member write, a handout to anything that can write and a write through a local
// alias each replace a slot the reader would otherwise trust, and the call site's literal stops
// describing what came back. A callee keeping no other reference still resolves.
function viaMember(box, key, value) { box[key] = value; return box; }
function viaBuiltin(box, key, value) { Object.defineProperty(box, key, { value: value, configurable: true }); return box; }
function viaAlias(box, key, value) { const alias = box; alias[key] = value; return box; }
function clean(box) { return box; }
export const declinedMember = viaMember({ M: Array }, 'M', Map).M.groupBy([1], x => x);
export const declinedBuiltin = viaBuiltin({ S: Array }, 'S', Set).S.union(new Set());
export const declinedAlias = viaAlias({ P: Array }, 'P', Promise).P.withResolvers();
export const resolved = clean({ A: Array }).A.of(2);
