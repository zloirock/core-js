import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// inline object literal with a method whose body returns: `({ foo() { return 1; } });`
// the `return` is INSIDE the ObjectMethod's own function scope, not the IIFE. the exit
// scan must treat ObjectMethod as a nested function boundary and not descend into its
// body, else the return is misread as a propagating IIFE exit that over-bails the narrow
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