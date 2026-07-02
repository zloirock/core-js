// arrow IIFE receiver detection peels paren and TS wrappers at every step of the
// comma-expression walk. When the parser preserves parens as AST nodes, the peel
// reaches the inner identifier `Array` under any wrapper combination, so the rewrite
// binds the receiver instead of falling back to a per-key destructure-default
(({from}) => from([1]))((0, (1, Array)));
