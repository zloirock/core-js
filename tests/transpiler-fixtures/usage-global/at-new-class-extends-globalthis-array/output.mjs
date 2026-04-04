import "core-js/modules/es.array.at";
import "core-js/modules/es.global-this";
class MyArray extends globalThis.Array {}
new MyArray().at(-1);