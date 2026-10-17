// Side effects harvested and re-emitted by a receiver collapse keep their own polyfillable content rewritten: the harvested
// subtrees are rescued from the collapse's visitor skip, so their queued rewrites compose into the re-emitted text (a bare re-emit
// shipped raw natives to targets without them).
let a1;
const { iterator } = globalThis[(a1 = Array.of(1), 'self')].Symbol;
export const r1 = [typeof iterator, a1.length];
