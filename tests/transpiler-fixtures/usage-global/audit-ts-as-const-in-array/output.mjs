import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// TS `as const` is a runtime no-op, so `('from' as const) in Array` polyfills
// `Array.from`/related as if the LHS were a bare string.
'from' as const in Array;