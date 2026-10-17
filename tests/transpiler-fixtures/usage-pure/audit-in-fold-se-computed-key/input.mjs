// a folded `in` receiver accessed through a side-effecting COMPUTED KEY
// (`globalThis[(eff(), 'Object')]`) must still run the key's effect. the fold discards the whole
// member, but the bracket-key sequence's leading push is observable and was previously dropped
// because the harvest walked only the object spine, never the computed key
const log = [];
const r = 'fromEntries' in globalThis[(log.push(1), 'Object')];
export { r };
