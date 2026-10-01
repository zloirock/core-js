// an optional inner method call reached through a side-effecting COMPUTED KEY, with a trailing
// instance hop. per ECMA the receiver object evaluates before the computed key, so the receiver
// memo must precede the key effect in the combined-chain emit - earlier the key effect ran first
const log = [];
function recv() { log.push('recv'); return [[1]]; }
function key() { log.push('key'); return 'flat'; }
const r = recv()[(key(), 'flat')]?.().map(x => x);
export { r };
