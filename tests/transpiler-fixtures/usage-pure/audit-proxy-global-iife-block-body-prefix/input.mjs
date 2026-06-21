// block-bodied IIFE with prefix ExpressionStatement: the single-return inline-call resolution
// must accept an ExpressionStatement preceding the single ReturnStatement (its side effects
// ride the polyfill emit's side-effect channel) and locate the ReturnStatement.argument as the
// inline body expression - here the argument is the proxy-global identifier
let setup = 0;
const out = (() => { setup++; return globalThis; })().Array.from([1, 2, 3]);
out.at(0);
