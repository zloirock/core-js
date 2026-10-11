import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator from "@core-js/pure/actual/iterator";
import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
import _URL$canParse from "@core-js/pure/actual/url/can-parse";
import _URL from "@core-js/pure/actual/url/constructor";
// a reassigned constructor alias reads its statics through a runtime identity guard; a read the guard
// leaves raw (an optional call over it, a call through its own `?.`, a key that runs code) reads the
// static off the swapped binding, so the alias imports the whole constructor - one constructor per row.
// a read the guard serves keeps the narrow entry
class Shim {}
let M = _Map;
if (_globalThis.c) M = Shim;
export const grouped = M.groupBy?.([1, 2], x => x % 2);
let P = _Promise;
if (_globalThis.c) P = Shim;
export const resolvers = P?.withResolvers();
let I = _Iterator;
if (_globalThis.c) I = Shim;
let n = 0;
export const iterated = I[n++, 'from']([1]);
let U = _URL;
if (_globalThis.c) U = Shim;
export const parsable = (U === _URL ? _URL$canParse : U.canParse.bind(U))('x:');