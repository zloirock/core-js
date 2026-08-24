// proxy-global static through a SEQUENCE receiver with a DEEPER proxy chain (`globalThis.self.Array`):
// the whole chain - globalThis, self, and the Array member - is subsumed by the static rewrite
// (`_Array$from`), so none may add a parallel global polyfill overlapping it (a crash
// before). the SE prefix survives in order
const log = [];
(log.push("e"), globalThis.self.Array).from([1, 2]);
