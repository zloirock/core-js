import _AggregateError from "@core-js/pure/actual/aggregate-error/constructor";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _URL$canParse from "@core-js/pure/actual/url/can-parse";
import _URL from "@core-js/pure/actual/url/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
import _WeakSet from "@core-js/pure/actual/weak-set/constructor";
// a single return that selects - a conditional, a logical, an alias of a selection - is a route the
// census does not follow: pure reads the static off the call raw, and each constructor an arm may hand
// back keeps its narrow entry, which carries none of its statics, while usage-global injects the static
// by its key. a single return of one constructor is served by name
const on = [1].length > 0;
const off = [].pop();
function map() {
  return on ? _Map : _Set;
}
function promise() {
  return on ? _Promise : _Promise;
}
function iterator() {
  return off || _Iterator;
}
const selected = on ? _AggregateError : _WeakMap;
function error() {
  return selected;
}
const symbol = () => on ? _Symbol : _WeakSet;
function url() {
  return _URL;
}
export const grouped = map().groupBy([1], x => x);
export const resolvers = promise().withResolvers();
export const iterated = iterator().from([1]);
export const isError = error().isError(null);
const held = symbol();
export const key = held.for('x');
export const parses = _URL$canParse('a:b');