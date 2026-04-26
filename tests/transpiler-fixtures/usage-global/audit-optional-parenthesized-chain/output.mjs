import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.string.includes";
import "core-js/modules/esnext.iterator.includes";
// parenthesised optional chain `(x?.a)?.b`: parentheses must not break the chain
// tracking for downstream instance polyfill rewrites.
(arr?.includes)(1);