import _isIterable from "@core-js/pure/actual/is-iterable";
// `Symbol.iterator in obj` rewrite must preserve LHS side-effects when the computed-key
// has a SequenceExpression (`Symbol[(logCall(), 'iterator')]`). without `visitSymbolInLhsSe`
// the call replacement `_isIterable({})` silently dropped `logCall()` - SOUNDNESS.
// covers both babel-plugin and unplugin handleInExpression paths
declare const logCall: () => void;
const r = (logCall(), _isIterable({}));