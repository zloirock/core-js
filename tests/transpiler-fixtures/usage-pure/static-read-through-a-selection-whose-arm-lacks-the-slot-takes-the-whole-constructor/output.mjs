import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator from "@core-js/pure/actual/iterator";
import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _Symbol$for from "@core-js/pure/actual/symbol/for";
import _URL from "@core-js/pure/actual/url";
// a static read through a selection of containers one arm of which holds no such slot names no single
// constructor: the read stays as written and reads the static off what the other arm holds, so that
// constructor takes its whole entry - an empty literal, one spelled in place, an array hole and a class
// without the static alike, one constructor per row. a container holding the slot is read by name
const spare = {};
const maps = {
  C: _Map
};
const viaMaps = _globalThis.c ? spare : maps;
export const grouped = viaMaps.C.groupBy([1, 2], x => x % 2);
const promises = {
  C: _Promise
};
export const resolvers = typeof (_globalThis.c ? {} : promises).C.withResolvers;
const holes = [];
const iterators = [_Iterator];
const viaIterators = _globalThis.c ? holes : iterators;
export const iterated = typeof viaIterators[0].from;
class Plain {}
const urls = {
  C: _URL
};
const viaUrls = _globalThis.c ? Plain : urls;
export const parsable = viaUrls.C.canParse('x:');
const symbols = {
  C: _Symbol
};
export const registered = typeof _Symbol$for('k');