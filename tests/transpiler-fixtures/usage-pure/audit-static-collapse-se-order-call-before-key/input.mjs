// A static-collapse receiver discards the WHOLE receiver, so its side effects re-emit as a sequence prefix.
// They must run in SOURCE-EVAL order: the chain-root CALL (the deepest object) evaluates BEFORE the shallower
// computed hop-key. A two-step harvest that appended the chain-root call LAST reversed source `(call, key)`
// to `(key, call)` on BOTH emitters (consistent but wrong vs native order). The `.self` hop keeps the
// receiver a proxy-global static chain; distinct static method per line.
const log = [];
const callBeforeKey = (() => { log.push("call"); return globalThis; })()[(log.push("key"), "self")].Array.of(1);
const keyOnly = globalThis[(log.push("k2"), "self")].Array.from([2]);
export { callBeforeKey, keyOnly, log };
