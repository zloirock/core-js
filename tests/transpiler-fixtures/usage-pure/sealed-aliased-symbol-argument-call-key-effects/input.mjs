// A sealed optional lookup with an aliased symbol key precedes an argument call.
// Its receiver prefix and getter run before the key effect, once each.
const key = Symbol.iterator;
const log = [];
const box = { get list() { log.push('receiver'); return ['held']; } };
export const result = ((log.push('prefix'), box.list)?.[(log.push('key'), key)])(0).next().value;
