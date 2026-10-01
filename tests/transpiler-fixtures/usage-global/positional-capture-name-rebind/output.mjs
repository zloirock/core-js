import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Replacing a source name leaves its previously captured array or string intact.
let array = [1];
const [savedArray] = [array];
array = '02';
savedArray.at;
let string = '02';
const [savedString] = [string];
string = [1];
savedString.includes;