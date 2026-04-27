import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// TS `as const` on LHS of `in`: `('from' as const) in Array`. TS-cast is a runtime no-op
// (`'from' as const` evaluates to the literal `'from'`); resolveKey peels the TS wrapper
// and resolves the LHS to the string key `'from'`. usage-global dispatches through the
// standard meta resolver - bare-string LHS reaches the static polyfill at the resolved
// receiver (es.array.from) plus side-effect imports of related iterator helpers
'from' as const in Array;