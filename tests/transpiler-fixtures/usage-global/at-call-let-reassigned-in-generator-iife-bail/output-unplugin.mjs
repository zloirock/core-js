import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
let x = [];
(function*() { x = "hello"; })().next();
x.at(-1);