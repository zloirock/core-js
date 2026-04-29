import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.string.repeat";
// IIFE return-expression inlining for receiver type only fires for plain functions.
// async / generator functions wrap the bare return in Promise / Generator, so inlining
// the return value would misclassify the call result. async case below: receiver is a
// Promise, not a string - `padStart` lookup on Promise has no string-method match, so
// `es.string.pad-start` must NOT be emitted. sync IIFE control on the next line WOULD
// trigger a string-method polyfill for symmetry, but uses a different method to keep
// the per-line origin of imports unambiguous
(async () => 'hello')().padStart(5);
(() => 'world')().repeat(3);