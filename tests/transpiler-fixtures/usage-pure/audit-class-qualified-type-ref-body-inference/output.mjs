import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// a class lives inside a TS namespace and a parameter is typed `NS.Box`. its method has NO
// return-type annotation, so resolving the qualified type reference to that class unlocks
// body-inference: `.method()` is `number[]` and `.at(0)` picks the Array-narrow entry.
// without qualified-name handling the lookup is null and `.at()` hits the generic entry.
namespace NS {
  export class Box {
    method() {
      return [1, 2, 3];
    }
  }
}
function f(x: NS.Box) {
  var _ref;
  return _atMaybeArray(_ref = x.method()).call(_ref, 0);
}
export { f };