import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// the container's OWN wrappers must be peeled before the slot pairing reads it: one parser strips a
// paren at parse time and the other keeps it as a node, so an unpeeled pairing resolves on one
// emitter and bails on the other. a cast erases at runtime and must not change the answer either,
// and a sequence prefix contributes only its tail. the last line is the negative: peeling a wrapper
// does not weaken the spread gate, whose slot still has no static position. distinct method per line.
const [parenWrap] = [_globalThis];
const [castWrap] = [_globalThis] as any;
const [seqWrap] = (effect(), [_globalThis]);
const [spreadShifted] = [...src, _globalThis];
export const r1 = _Array$from([1]);
export const r2 = _Array$of(2);
export const r3 = _Symbol$iterator;
export const r4 = spreadShifted.Map;