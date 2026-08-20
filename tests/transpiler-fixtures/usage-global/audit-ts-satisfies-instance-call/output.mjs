import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.string.includes";
import "core-js/modules/esnext.iterator.includes";
// TS `satisfies` cast on an instance-method receiver: the cast is peeled so the
// instance call is still rewritten through the polyfill.
(arr.includes satisfies any)(1);