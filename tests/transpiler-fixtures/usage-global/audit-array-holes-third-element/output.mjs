import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Both skipped elements are arrays. Only the third slot supplies a string.
const [,, third] = [[1], [2], 'c'];
third.at(0);

// The same pattern selects an array when only the third slot is an array.
const [,, last] = ['a', 'b', [3]];
last.includes(3);