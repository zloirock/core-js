// A discarded keyed assignment keeps its default in the raw slot.
// The overwrite follows it inside the sequence and reads the substituted realm.
let method;
const after = (({ [(effect(), Symbol.iterator)]: method = fallback() } = globalThis), finish());
