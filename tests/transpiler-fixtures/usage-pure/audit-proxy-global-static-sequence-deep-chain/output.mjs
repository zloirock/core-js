import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// proxy-global static through a SEQUENCE receiver with a DEEPER proxy chain (`globalThis.self.Array`):
// the whole chain - globalThis, self, and the Array member - is subsumed by the static rewrite
// (`_Array$from`), so none queue a parallel global polyfill overlapping it (which would crash
// unplugin's text-transform queue). the SE prefix survives in order
const log = [];
(_pushMaybeArray(log).call(log, "e"), _Array$from)([1, 2]);