// a static read through a selection of containers one arm of which holds no such slot names no single
// constructor: the read stays as written and reads the static off what the other arm holds, so that
// constructor takes its whole entry - an empty literal, one spelled in place, an array hole and a class
// without the static alike, one constructor per row. a container holding the slot is read by name
const spare = {};
const maps = { C: Map };
const viaMaps = globalThis.c ? spare : maps;
export const grouped = viaMaps.C.groupBy([1, 2], x => x % 2);
const promises = { C: Promise };
export const resolvers = typeof (globalThis.c ? {} : promises).C.withResolvers;
const holes = [];
const iterators = [Iterator];
const viaIterators = globalThis.c ? holes : iterators;
export const iterated = typeof viaIterators[0].from;
class Plain {}
const urls = { C: URL };
const viaUrls = globalThis.c ? Plain : urls;
export const parsable = viaUrls.C.canParse('x:');
const symbols = { C: Symbol };
export const registered = typeof symbols.C.for('k');
