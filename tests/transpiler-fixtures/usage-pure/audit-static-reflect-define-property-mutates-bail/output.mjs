import _Array$of from "@core-js/pure/actual/array/of";
import _Reflect$defineProperty from "@core-js/pure/actual/reflect/define-property";
// Reflect.defineProperty has the same monkey-patch semantics as Object.defineProperty,
// only the return shape differs (boolean instead of throwing). the mutation pre-pass
// must mark Array.from so the subsequent call is preserved verbatim. an unrelated
// static (Array.of) on the same constructor is NOT mutated and must still be polyfilled.
_Reflect$defineProperty(Array, "from", {
  value: function () {
    return [];
  }
});
Array.from([1, 2, 3]);
_Array$of(4, 5);