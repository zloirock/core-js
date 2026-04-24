// webpack-style indirect require `(0, require)('core-js/...')` preserves the pre-ES2015
// "indirect eval" shape that detaches the call from the lexical `require` binding. entry
// detection must peel the SequenceExpression tail so the call still registers
(0, require)('core-js/actual/array/from');
