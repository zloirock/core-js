// The prefix runs once before the optional calls, even when the loader is nullish.
function logRequire() { return 'logged'; }
(logRequire(), require)?.('core-js/actual/array/from');
