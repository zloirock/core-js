// TS enum initializer wrapped in parentheses: the polyfill rewrite must thread through
// the parens to recognise the underlying expression.
enum E {
  A = (1 + 2),
  B = (3 + 4),
}
const arr: number[] = [E.A, E.B];
arr.at(0);
