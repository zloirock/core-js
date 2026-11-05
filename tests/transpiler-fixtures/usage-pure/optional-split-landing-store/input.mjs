// A stored realm receiver keeps its source prefix and write before the optional continuation.
// Pure serves supported statics and prototype methods while a missing method keeps its optional argument guard.
const realm = globalThis;
let held;
const log = [];
const value = (log.push('root'), held = realm)?.Object[(log.push('key'), 'values')]({ a: 5 }).at(0);
const has = (held = realm)?.Map?.prototype.has.call(new Map([[1, 3]]), 1);
const missing = (held = realm)?.Map?.optionalSplitMissing?.(log.push('arg'));
