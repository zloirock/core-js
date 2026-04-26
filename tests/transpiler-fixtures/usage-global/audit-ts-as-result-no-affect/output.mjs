import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
// `(Map.groupBy(...) as any)` cast on a polyfilled call result: the cast does not
// affect rewriting - the inner call is still polyfilled.
arr.at(-1) as number;
arr.includes(1) satisfies boolean;
Array.from!([1]) as any[];