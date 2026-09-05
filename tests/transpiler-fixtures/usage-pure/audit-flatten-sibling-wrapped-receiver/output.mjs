import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Number$isFinite from "@core-js/pure/actual/number/is-finite";
import _Number$isInteger from "@core-js/pure/actual/number/is-integer";
import _Number$isSafeInteger from "@core-js/pure/actual/number/is-safe-integer";
import _Object$assign from "@core-js/pure/actual/object/assign";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$freeze from "@core-js/pure/actual/object/freeze";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
// the flatten's sibling walk climbs from a matched receiver identifier up its member chain to decide
// whether another channel owns it. a cast or a paren sitting BETWEEN the two is transparent to that
// question - the chain is still the one rooted at this receiver - so stopping there claimed a receiver
// the member's own rewrite then replaced wholesale. every wrapper the language puts in that position,
// with the key resolved in a nested scope and in place
const of = _Array$of;
const cast = _Promise;
const from = _Array$from;
const nonNull = _Set;
const entries = _Object$entries;
const paren = _Promise;
const assign = _Object$assign;
const satisfied = _Map;
const isInteger = _Number$isInteger;
const nested = () => {
  const NAME = 'Promise';
  return _Promise;
}; // a claim does not have to be ROOTED at the receiver to erase it: one that merely CONTAINS it takes
// it along, so the walk stands down there too. the argument of a call whose result is claimed, in
// both key spellings and through a static off a constructor
function identity(value) {
  return value;
}
const {
  isArray
} = _globalThis.Array;
const callArg = _Promise;
const isSafeInteger = _Number$isSafeInteger;
const callArgComputed = _Set;
const freeze = _Object$freeze;
const callArgStatic = _Object$fromEntries([]); // negatives: no wrapper at all, and a containing member whose key claims nothing
const isFinite = _Number$isFinite;
const plain = _Promise;
const keys = _Object$keys;
const unclaimed = identity(_globalThis).noSuchThing;
export { of, cast, from, nonNull, entries, paren, assign, satisfied, isInteger, nested, isFinite, plain };
export { isArray, callArg, isSafeInteger, callArgComputed, freeze, callArgStatic, keys, unclaimed };