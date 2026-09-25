// a static read through an array slot the literal fills with a call resolves through that call, as a
// read through an object slot does; a slot written after the literal is no longer the call's, and a
// slot holding data stays an instance receiver
function map() { return Map; }
function iterator() { return Iterator; }
function promise() { return Promise; }
function items() { return [1, 2]; }
const maps = [map()];
export const grouped = maps[0].groupBy([1], x => x);
export const iterated = [iterator()][0].from([1]);
const promises = [promise()];
promises[0] = { withResolvers: () => 'written' };
export const resolvers = promises[0].withResolvers();
export const first = [items()][0].at(0);
