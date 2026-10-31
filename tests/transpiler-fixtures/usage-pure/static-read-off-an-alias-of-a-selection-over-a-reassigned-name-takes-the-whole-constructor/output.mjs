import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator from "@core-js/pure/actual/iterator";
import _Map from "@core-js/pure/actual/map";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
import _Promise from "@core-js/pure/actual/promise";
import _URL$canParse from "@core-js/pure/actual/url/can-parse";
import _URL from "@core-js/pure/actual/url/constructor";
// a name some write reassigns is read through the identity guard its writes register, and so is a plain
// alias of it; an alias of a selection of it with another value holds what no such guard names, so the read
// stays as written and the constructor takes its whole entry - a written for-of head and a written binding,
// selected by `??`, `||` or a ternary, one constructor per row. a plain alias keeps the guard
const iterated = [];
for (let X of [_Iterator, Array]) {
  if (iterated.length) X = null;
  const held = X ?? Object;
  (_pushMaybeArray(iterated) || 0).call(iterated, typeof held.from);
}
export { iterated };
let M = _Map;
if (_globalThis.c) M = null;
const maps = M || Object;
export const grouped = (maps === Object ? _Object$groupBy : maps.groupBy.bind(maps))([1, 2], x => x % 2);
let P = _Promise;
if (_globalThis.c) P = null;
const promises = _globalThis.d ? Object : P;
export const resolvers = typeof promises.withResolvers;
let U = _URL;
if (_globalThis.c) U = null;
const urls = U;
export const parsable = (urls === _URL ? _URL$canParse : urls.canParse.bind(urls))('x:');