// auto-injected polyfill imports must remain ASI-safe when an existing core-js import
// already separates the `var x = 1` line from the IIFE.
var x = 1
import 'core-js/modules/es.array.from'
;(function () { x(); })()
