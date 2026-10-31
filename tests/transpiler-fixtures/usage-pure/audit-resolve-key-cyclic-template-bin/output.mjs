import _isIterable from "@core-js/pure/actual/is-iterable";
import _Set from "@core-js/pure/actual/set/constructor";
// computed Symbol keys built from a template literal AND a binary `+` concatenation must
// fold to the static string `'iterator'` so the `in` check routes to the iterator
// polyfill. each fold path uses an independent cycle guard
const suffix = 'to';
// template-literal `itera${suffix}r` -> 'iterator'
const a = _isIterable([]);
// binary `+`: 'iter' + 'ator' -> 'iterator'
const k = 'iter' + 'ator';
const b = _isIterable(new _Set());
export { a, b };