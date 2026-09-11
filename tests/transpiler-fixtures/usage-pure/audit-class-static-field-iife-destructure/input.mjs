// instance field IIFE destructures `Array.from` and returns the binding; static
// field IIFE additionally calls it. plugin recognizes the destructure-bound `from`
// in both initializer arrow scopes and substitutes the polyfill alias - the
// `static` modifier is transparent to the destructure-substitution path
class C {
  x = (() => { const { from } = Array; return from; })();
  static y = (() => { const { from } = Array; return from([1]); })();
}
new C();
