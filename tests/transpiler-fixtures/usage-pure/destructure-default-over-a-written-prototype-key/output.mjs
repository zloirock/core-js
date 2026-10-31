import _Array$of from "@core-js/pure/actual/array/of";
import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Promise from "@core-js/pure/actual/promise";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Set from "@core-js/pure/actual/set";
import _URL from "@core-js/pure/actual/url";
import _URL$canParse from "@core-js/pure/actual/url/can-parse";
// a slot default fires only where the slot is undefined, and a key the FILE writes onto a prototype
// is one every literal of that chain inherits - an array hole included: none of the first three
// bindings is certainly its default, so pure guards each static read on the default's constructor and
// usage-global injects for it. a key nothing writes there, and a slot past an array's end, which the
// iterator never reads, stay certain, and pure reads the default's static outright
Object.prototype.lent = _Set;
const {
  lent: L = Array
} = {};
export const viaWrite = (L === Array ? _Array$of : L.of.bind(L))(1);
Object.defineProperty(Object.prototype, 'given', {
  value: _Set
});
const {
  given: G = Object
} = {};
export const viaDefine = (G === Object ? _Object$fromEntries : G.fromEntries.bind(G))([]);
Array.prototype[0] = _Set;
const [H = _Map] = [,];
export const viaHole = (H === _Map ? _Map$groupBy : H.groupBy.bind(H))([], x => x);
const {
  other: O = _Promise
} = {};
export const viaUnwritten = _Promise$allSettled([]);
const [P = _URL] = [];
export const viaPastTheEnd = _URL$canParse('a:b');