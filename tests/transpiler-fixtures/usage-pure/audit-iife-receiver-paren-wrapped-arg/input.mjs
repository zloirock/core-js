// arrow IIFE receiver detection peels `ParenthesizedExpression` + TS wrappers at every
// step of the SequenceExpression walk. Under `createParenthesizedExpressions: true` the
// parens persist as AST nodes; the peel reaches the inner Identifier `Array` under any
// wrapper combination so the synth-swap binds the receiver instead of falling back to
// inline-default
(({from}) => from([1]))((0, (1, Array)));
