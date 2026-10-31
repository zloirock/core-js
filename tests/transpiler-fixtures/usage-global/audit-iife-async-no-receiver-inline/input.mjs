// IIFE return-expression inlining for receiver type must fire only for plain functions:
// async / generator functions wrap the bare return in Promise / Generator, so inlining the
// return value would misclassify the call result. async case: receiver is a Promise, not a
// string, so `padStart` has no match and `es.string.pad-start` must NOT emit. sync IIFE
// control on the next line WOULD emit a string-method polyfill (distinct method, clear origin).
(async () => 'hello')().padStart(5);
(() => 'world')().repeat(3);
