import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// Namespace-local type used as a FUNCTION PARAMETER annotation. distinct from the
// direct-binding annotation case (`declare const x: LocalArr`) - param resolution goes
// through a different binding-init branch but routes the type-lookup through the same
// `findTypeDeclaration` helper. should benefit from the lookup-path fallback as well.
namespace NS {
  type LocalArr = number[];
  function process(x: LocalArr) {
    _atMaybeArray(x).call(x, 0);
  }
}