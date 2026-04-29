import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.to-string";
// computed-key Symbol access via array-index expression: `Symbol[[1, 2][0]]`. plugin
// doesn't statically fold `[1,2][0]` to `1` for Symbol-key resolution - the LHS resolves
// to Symbol[runtime-value], which doesn't match a known well-known. plugin registers
// only the base Symbol polyfills (es.symbol.constructor, es.symbol.description) for the
// `Symbol` reference itself, no iterator-specific suite injection
Symbol[[1, 2][0]] in obj;