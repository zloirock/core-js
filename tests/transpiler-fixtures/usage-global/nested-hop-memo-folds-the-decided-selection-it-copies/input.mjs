// in usage-global nothing is rewritten, so no memo copies the selection: each leaf of the nested hop
// loads its method for every family an unknown receiver may hold, and the decided selections in the key
// and in the argument load only the `Symbol` modules their tests read
let at, flat, includes, keys;
({ a: { at, flat } } = box[typeof Symbol != 'undefined' ? 'a' : 'b']);
({ c: { includes, keys } } = make(typeof Symbol != 'undefined' && 1));
export { at, flat, includes, keys };
