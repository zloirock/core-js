// nested proxy-global flatten declarator next to a sibling reading a multi-hop static off a
// DIFFERENT constructor on the same proxy-global root (`globalThis.Number.isInteger`). the
// receiver-ref skip-check must recognise the static-on-constructor shape for any known
// constructor, not just Object - otherwise the shared `globalThis` root is double-substituted
// and compose crashes
const { Array: { from } } = globalThis, isInt = globalThis.Number.isInteger(2);
from([1]);
isInt;
