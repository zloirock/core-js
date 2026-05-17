import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// inline object literal with a method whose body returns: `({ foo() { return 1; } });`
// the `return` is INSIDE the ObjectMethod's own function scope, not the IIFE. without
// adding ObjectMethod to NESTED_BINDING_INTRODUCERS, `subtreeContainsExit` descends into
// the method body and flags the return as a propagating IIFE exit - over-bailing the
// straight-line `x = "hello"` that follows
let x = [1, 2, 3];
(() => {
  ({
    foo() {
      return 1;
    }
  });
  x = "hello";
})();
_atMaybeString(x).call(x, 0);