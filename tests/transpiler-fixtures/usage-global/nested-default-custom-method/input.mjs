// A defaulted slot and its custom method getter each run once.
const source = { get list() { effect('list'); return receiver; } };
const { list: { entries } = Object } = source;
use(entries.call(receiver));
