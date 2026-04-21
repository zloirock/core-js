// `(0, 'iterator')` - SequenceExpression with pure preceding. unwrapParens unwinds to
// the last expression, so resolveKey folds the whole chain to 'iterator'. Symbol[(0,'iterator')]
// should polyfill as Symbol.iterator
const x = Symbol[(0, 'iterator')];
