import 'core-js/actual/promise/try';
let x = function () { return 42; }
(function () { Promise.try(() => 1); })();
