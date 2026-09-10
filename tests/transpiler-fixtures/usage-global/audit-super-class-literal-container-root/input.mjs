// a super-class reached through a global alias that a LITERAL container binds names the same proxy
// global a bare alias does, so the base read alone owes the whole family - which is all usage-global
// can observe here: the static super-call adds no module of its own. this is a different shape from
// the key-path form (`{ Promise: P } = globalThis`), which reads a slot OFF the global - a container
// carries the global as its slot VALUE. the method-level resolution and its negatives are the
// usage-pure sibling's lock. distinct base per line.
const [arrayWrap] = [globalThis];
const { slot: objectWrap } = { slot: globalThis };
const [[nestedWrap]] = [[globalThis]];
export class ViaArray extends arrayWrap.Promise { static m() { return super.any([]); } }
export class ViaObject extends objectWrap.Promise { static m() { return super.allSettled([]); } }
export class ViaNested extends nestedWrap.Promise { static m() { return super.race([]); } }
