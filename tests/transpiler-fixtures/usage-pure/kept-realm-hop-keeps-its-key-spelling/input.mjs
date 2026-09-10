// a realm hop the collapse KEEPS keeps the key spelling the source wrote: the hop survives the
// swap, so re-spelling its quiet computed key dotted rewrites a read nothing else touches. the
// boundary is the hop under it - a bare proxy root already keeps its brackets - and an
// effect-bearing key keeps its own sequence either way.
// observable as TEXT: the import set and the runtime value are identical for both spellings, so
// no differential row can see this class
let e = 0;

// the kept probe stands over a BACKED hop, which is what respells the tail over the ponyfill
export const literalKey = globalThis.self['window'];
export const templateKey = globalThis.self[`window`];
export const bothComputed = globalThis['self']['window'];

// NEGATIVE: a bare proxy root has no tail to respell, and its key already stays as written
export const bareRootKey = self['window'];

// NEGATIVE: an EFFECT-bearing key is no name at all - it keeps its sequence in a computed slot
export const effectKey = globalThis.self[(e++, 'window')];

export const keep = [1].at(0);
export { e };
