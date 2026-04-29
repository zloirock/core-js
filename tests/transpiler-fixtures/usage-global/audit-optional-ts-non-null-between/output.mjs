import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
// TS `!` non-null between optional accesses `x?.a!.b`: the wrapper must be peeled
// for the chain rewrite to recognise the receiver shape.
arr?.at(-1)!.includes("x");