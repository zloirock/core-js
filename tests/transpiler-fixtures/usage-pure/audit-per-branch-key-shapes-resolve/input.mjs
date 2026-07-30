// the per-branch synth probes the receiver with the key's resolved NAME. that name has to come from
// the shared resolver: a string or numeric key carries it somewhere other than the node's `name`
// slot, and reading that slot raw probes with `undefined` - the branch then looks polyfill-free and
// the raw global survives, unpolyfilled, on a receiver whose type is perfectly well known
const cond = Math.random() > 0.5;
const { 'from': f } = cond ? Array : Set;
const { of } = cond ? Array : Set;
const { 0: zero, 'entries': e } = cond ? Object : Map;
const { ['ke' + 'ys']: k } = cond ? Object : Map;
const { [`val${ 'ues' }`]: v } = cond ? Object : Map;
export { f, of, zero, e, k, v };
