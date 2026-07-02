// nested proxy-global flatten declarator next to a sibling whose init is a multi-hop static
// off the same proxy-global root (`globalThis.Object.fromEntries`). the root's key (`Object`)
// has no whole-constructor polyfill, so the receiver-ref skip-check must walk the full enclosing
// member chain to the static method - otherwise the receiver root gets double-substituted
const { Array: { from } } = globalThis, x = globalThis.Object.fromEntries([]);
from([1]);
