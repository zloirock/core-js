// adjacent IIFE-style `} (` boundary across two top-level statements: the plugin must
// not misread it as a single call expression and break the polyfill rewrite.
import 'core-js/actual/promise/try';
let x = function () { return 42; }
(function () { Promise.try(() => 1); })();
