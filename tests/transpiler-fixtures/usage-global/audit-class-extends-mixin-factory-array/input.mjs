// a global read standing in the `extends` clause is still visited: `Array` reaches the detector as
// the argument of the mixin call there and its whole family enters the import set. what that set
// cannot separate is the clause position - a bare `Mix(Array);` statement answers the same - so the
// lock here is that the clause is walked at all, not that it has a route of its own
function Mix(Base) {
  return class extends Base {
    extra() { return 42; }
  };
}
class X extends Mix(Array) {
  flatten(arr) { return arr.flat(); }
}
new X().flatten([[1], [2]]);
