// auto-injected polyfill imports must be ASI-safe ahead of an IIFE-like preceding line
// (the bare `var x = 1` without a trailing semicolon).
var x = 1
import 'core-js/actual/array/from'
;(function () { x(); })()
