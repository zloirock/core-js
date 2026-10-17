// A source-known false caller selects only the null arm, so the unreachable array arm has no runtime
// instance read and adds no Array `at` polyfill. The computed key remains in source syntax.
let keys = 0;
function nullable(value) {
  const {
    [(keys++, 'at')]: method
  } = value ? [1] : null;
  return method;
}
try {
  nullable(false);
} catch {}
export { keys };