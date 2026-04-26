// stage-3 auto-accessor `accessor x = new Set()` with a decorator on the class member:
// the initializer expression is still scanned for runtime built-ins and polyfilled.
class A {
  @dec accessor x = new Set();
}
