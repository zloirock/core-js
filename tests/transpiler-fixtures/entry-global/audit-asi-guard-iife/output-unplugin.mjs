import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// auto-injected polyfill imports must be ASI-safe ahead of an IIFE-like preceding line
// (the bare `var x = 1` without a trailing semicolon).
var x = 1
;(function () { x(); })()