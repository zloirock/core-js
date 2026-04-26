import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.includes";
// TS `satisfies` cast on an instance-method receiver: the cast is peeled so the
// instance call is still rewritten through the polyfill.
(arr.includes satisfies any)(1);