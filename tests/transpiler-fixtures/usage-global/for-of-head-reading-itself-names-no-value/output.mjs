import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.keys";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.dom-collections.keys";
// a for-x head whose iterated literal reads the head itself (`for (const Y of [Y])` - a TDZ error with a
// lexical head, the previous value with a var one) names no value for it: a read off the head takes what
// an unknown receiver takes
for (const Y of [Y]) use(Y.keys());
for (var Z of [Z]) use(Z.at(0));