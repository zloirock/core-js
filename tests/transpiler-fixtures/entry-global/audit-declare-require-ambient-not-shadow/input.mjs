// ambient `declare const require` is tsc-elided; the runtime `require` call still
// resolves to the host global. polyfill-provider must NOT classify the declare as a
// shadow, otherwise the entry expansion is silently skipped. babel's adapter filters
// via `isAmbientBindingShape`; unplugin's `declaresRequireBinding` must match.
declare const require: (m: string) => unknown;
require('core-js/actual/array/from');
