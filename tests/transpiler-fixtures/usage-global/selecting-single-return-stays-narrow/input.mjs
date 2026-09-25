// a single return that selects - a conditional, a logical, an alias of a selection - is a route the
// census does not follow: pure reads the static off the call raw, and each constructor an arm may hand
// back keeps its narrow entry, which carries none of its statics, while usage-global injects the static
// by its key. a single return of one constructor is served by name
const on = [1].length > 0;
const off = [].pop();
function map() { return on ? Map : Set; }
function promise() { return on ? Promise : Promise; }
function iterator() { return off || Iterator; }
const selected = on ? AggregateError : WeakMap;
function error() { return selected; }
const symbol = () => on ? Symbol : WeakSet;
function url() { return URL; }
export const grouped = map().groupBy([1], x => x);
export const resolvers = promise().withResolvers();
export const iterated = iterator().from([1]);
export const isError = error().isError(null);
const held = symbol();
export const key = held.for('x');
export const parses = url().canParse('a:b');
