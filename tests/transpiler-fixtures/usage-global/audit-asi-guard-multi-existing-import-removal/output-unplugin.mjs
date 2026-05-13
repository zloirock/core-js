import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.array.from";
// Two consecutive pre-existing `import 'core-js/modules/...'` between an unterminated
// `var x = 1` and a leading-bracket statement. The plugin re-emits both modules through
// `addGlobalImport` and drops the originals; the second removal's backward ASI scan must
// skip past the prior removed range to detect the missing terminator and inject the guard.
var x = 1
;[1, 2, 3].forEach(n => x = n)
