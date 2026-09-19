import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.function.name";
import "core-js/modules/es.string.iterator";
// an instance method accessed in STATIC position on a constructor is gated: `Array.concat` reads
// Array.prototype.concat off the Array CONSTRUCTOR (which is not an array instance), so it is
// `undefined` at runtime - no es.array.concat injects. the valid static `Array.from` and the real
// Function.prototype method `Array.name` still resolve, since the Array constructor genuinely has them
Array.concat([1, 2, 3]);
Array.from([4, 5, 6]);
const n = Array.name;