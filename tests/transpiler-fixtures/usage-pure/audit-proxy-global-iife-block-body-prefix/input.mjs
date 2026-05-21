// block-bodied IIFE with prefix ExpressionStatement: `singleReturnBodyExpression` accepts
// ExpressionStatement preceding the single ReturnStatement (their side effects propagate
// through the polyfill emit's `meta.sideEffects` channel). `findReturnPath` walks the body
// to locate the ReturnStatement.argument path - ret is the proxy-global identifier
let setup = 0;
const out = (() => { setup++; return globalThis; })().Array.from([1, 2, 3]);
out.at(0);
