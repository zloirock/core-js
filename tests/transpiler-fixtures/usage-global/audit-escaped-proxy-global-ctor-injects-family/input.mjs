// a proxy-global constructor read that ESCAPES owes the whole family in this flavor too: the
// consumer it was handed reads statics off the reference, and the bare constructor module installs
// none of them. the other two rows are what a read that stays home owes - Set's namespace adds
// nothing over its constructor entry, and a generic member resolves away from the constructor
hand(globalThis.Map);
use(new globalThis.Set());
use(globalThis.WeakMap.name);
