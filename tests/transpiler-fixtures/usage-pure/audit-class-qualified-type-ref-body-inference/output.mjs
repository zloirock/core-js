import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// User declares a class inside a TS namespace and types a parameter as `NS.Box`.
// The class method has NO explicit return-type annotation - its return type is
// inferred from the body. Path-based `findClassPathForTypeReference` for qualified
// type references unlocks body-inference via `resolveClassMember` so `.method()`
// resolves to `number[]`, downstream `.at(0)` picks the Array-narrow polyfill entry.
// Without qualified-name handling, classPath lookup returns null, member access
// falls back to annotation-only resolution (no annotation present), and `.at()`
// lands on the generic entry. Discriminating revert: bare-Identifier branch only
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