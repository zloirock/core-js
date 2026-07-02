// bodyless control statement (`if (...) stmt` no braces) inside destructure init forces
// `kind: stmt` body-wrap. setScope on the inner instance polyfill walks up to the
// ExpressionStatement slot under IfStatement and registers WRAP_KIND_STMT. pins the
// `kind === stmt` branch of #bodyWrapText composed-text (no `return` insertion since the
// host slot is already a Statement)
const { from } = ((() => {
  if (Math.random() < 0) [1, 2, 3].at(0);
  return Array;
})(), Array);
console.log(from);
