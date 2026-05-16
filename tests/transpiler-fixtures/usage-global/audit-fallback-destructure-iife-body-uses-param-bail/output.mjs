// true negative: IIFE body references a param non-trivially. `(arg => [arg])(Array)`
// returns `[arg]` -- an ArrayExpression whose element refers to `arg`. peel can't lift
// the body (would lose the param-binding semantics): the resolver doesn't track
// per-arg value flow into nested expressions. `Result`'s type stays unknown, `from`
// destructured from it can't pin a constructor, no over-emission. regression guard
// against future over-eager peel attempts.
const Result = (arg => [arg])(Array);
const {
  from
} = Result;
from([1, 2]);