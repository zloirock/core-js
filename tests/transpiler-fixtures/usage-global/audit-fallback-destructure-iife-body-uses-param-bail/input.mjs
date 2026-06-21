// true negative: IIFE body references a param non-trivially. `(arg => [arg])(Array)`
// returns an ArrayExpression `[arg]` whose element refers to `arg`, so the body cannot
// be lifted without losing param-binding semantics (no per-arg value-flow tracking).
// `Result`'s type stays unknown, `from` destructured from it pins no constructor, no
// over-emission. regression guard against future over-eager peel attempts.
const Result = (arg => [arg])(Array);
const { from } = Result;
from([1, 2]);
