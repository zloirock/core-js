import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
// a claim nested in an optional chain that is NOT its own. the source is not rewritten under this
// method, so the import set is the whole observable - one method per row keeps a dropped module
// visible instead of letting a sibling mask it
const r1 = host?.fn(Array?.from([1]));
const r2 = host?.wrap[Array?.of(2).length];
const r3 = host?.a.b(Promise?.resolve(3));
const r4 = host?.fn?.(Object?.entries);
const r5 = globalThis.window?.Array.isArray([4]);
const r6 = list.flat?.(1);
console.log(r1, r2, r3, r4, r5, r6);