// `const A = Promise satisfies typeof Promise` — TSSatisfiesExpression variant of M-15.
// same treatment as `as` cast: `unwrapClassExpr` strips TS wrapper so alias chain
// resolves through to Promise.try and gets polyfilled via super-import mapping
const A = Promise satisfies typeof Promise;
class C extends A {
  static run() { return super.try(() => 1); }
}
globalThis.__r = C.run();
