import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Array-destructure reassign from a typed RHS: `let x; [x] = data` where `data: string[]`
// narrows `x` to string, so `x.at(0)` emits only the string-instance polyfill.
declare const data: string[];
let x;
[x] = data;
x.at(0);