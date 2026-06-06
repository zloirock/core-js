// optional indirect require with an observable side-effect prefix:
// `(sideEffect(), require)?.('core-js/...')`. babel models the optional call as an
// OptionalCallExpression (oxc folds the optional marker into a plain CallExpression), so the
// callee-sequence prefix must be recovered on both call shapes - the side effect outlives the
// entry rewrite the same way the non-optional `(logRequire(), require)('core-js/...')` does
function logRequire() { return 'logged'; }
(logRequire(), require)?.('core-js/actual/array/from');
