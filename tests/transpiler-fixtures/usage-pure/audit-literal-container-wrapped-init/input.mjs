// the container's OWN wrappers must be peeled before the slot pairing reads it: one parser strips a
// paren at parse time and the other keeps it as a node, so an unpeeled pairing resolves on one
// emitter and bails on the other. a cast erases at runtime and must not change the answer either,
// and a sequence prefix contributes only its tail. the last line is the negative: peeling a wrapper
// does not weaken the spread gate, whose slot still has no static position. distinct method per line.
const [parenWrap] = ([globalThis]);
const [castWrap] = [globalThis] as any;
const [seqWrap] = (effect(), [globalThis]);
const [spreadShifted] = ([...src, globalThis]);
export const r1 = parenWrap.Array.from([1]);
export const r2 = castWrap.Array.of(2);
export const r3 = seqWrap.Symbol.iterator;
export const r4 = spreadShifted.Map;
