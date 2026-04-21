import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// `(0, 'iterator')` - SequenceExpression with pure preceding. unwrapParens unwinds to
// the last expression, so resolveKey folds the whole chain to 'iterator'. Symbol[(0,'iterator')]
// should polyfill as Symbol.iterator
const x = _Symbol$iterator;