import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// ambient `declare const require` is tsc-elided; the runtime `require` call still
// resolves to the host global. polyfill-provider must NOT classify the declare as a
// shadow, otherwise the entry expansion is silently skipped. babel's adapter filters
// via an ambient-binding filter; unplugin's require-binding detector must match.
declare const require: (m: string) => unknown;