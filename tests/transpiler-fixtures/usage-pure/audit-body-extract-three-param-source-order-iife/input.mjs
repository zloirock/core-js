// three function params each with a polyfilled prop + rest sibling: all three bail to
// body-extract. emitted `let from` / `let keys` / `let resolve` must follow source order,
// not the REVERSE order produced by reusing the directive-anchor `insertAfter`. uses
// three distinct constructors / methods (Array.from, Object.keys, Promise.resolve) so the
// imports identify which param emitted which extract
// (immediately invoked: caller-lossy param emissions stay sound only when every call site is
// visible - a declared function's params now stay verbatim instead)
(function f({ from, ...r1 } = Array, { keys, ...r2 } = Object, { resolve, ...r3 } = Promise) {
  return [from([1]), keys({}), resolve(0), r1, r2, r3];
})();
