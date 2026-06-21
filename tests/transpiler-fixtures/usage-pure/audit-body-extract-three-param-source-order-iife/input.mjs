// three function params each with a polyfilled prop + rest sibling all bail to body-extract;
// emitted `let from` / `let keys` / `let resolve` must follow SOURCE order, not reverse.
// three distinct constructors (Array.from, Object.keys, Promise.resolve) so imports identify each.
// immediately invoked, so caller-lossy param emit is sound (every call site visible)
(function f({ from, ...r1 } = Array, { keys, ...r2 } = Object, { resolve, ...r3 } = Promise) {
  return [from([1]), keys({}), resolve(0), r1, r2, r3];
})();
