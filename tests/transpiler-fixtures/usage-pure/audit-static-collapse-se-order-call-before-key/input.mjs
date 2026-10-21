// A call root executes before a retained realm key. Nested key claims stay polyfilled and run once.
const log = [];
const callBeforeKey = (() => { log.push("call"); return globalThis; })()[(log.push("key"), "self")].Array.of(1);
const keyOnly = globalThis[(log.push("k2"), "self")].Array.from([2]);
export { callBeforeKey, keyOnly, log };
