import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// SequenceExpression as the computed key of a Symbol member access:
// `Symbol[(fn(), 'iterator')]` - prefix call is unconditionally evaluated before the
// well-known symbol resolution. the iterator-key resolver must preserve the SE prefix
// while still recognising the tail `'iterator'` as the well-known key, polyfilling
// `es.symbol.iterator` plus the iteration dependencies
const k = Symbol[side(), 'iterator'];
const arr = [];
arr[k]().next();