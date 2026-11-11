// Reanchoring a pattern-valued extraction preserves its source getter.
const realm = { get value() { effect(); return globalThis; } };
let custom;
({ Map: { custom } } = realm.value);
use(custom);
