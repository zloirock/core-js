import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator from "@core-js/pure/actual/iterator";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$withResolvers from "@core-js/pure/actual/promise/with-resolvers";
import _URL$canParse from "@core-js/pure/actual/url/can-parse";
import _URL from "@core-js/pure/actual/url/constructor";
// Optional calls and optional members of a selected constructor use an identity guard.
// An effectful key stays raw and requires the whole constructor; guarded reads keep narrow entries.
class Shim {}
let M = _Map;
if (_globalThis.c) M = Shim;
export const grouped = M === _Map ? _Map$groupBy([1, 2], x => x % 2) : M.groupBy?.([1, 2], x => x % 2);
let P = _Promise;
if (_globalThis.c) P = Shim;
export const resolvers = null == P ? void 0 : P === _Promise ? _Promise$withResolvers() : P.withResolvers();
let I = _Iterator;
if (_globalThis.c) I = Shim;
let n = 0;
export const iterated = I[n++, 'from']([1]);
let U = _URL;
if (_globalThis.c) U = Shim;
export const parsable = (U === _URL ? _URL$canParse : U.canParse.bind(U))('x:');