// Namespace-local type used as a FUNCTION PARAMETER annotation. distinct from the
// direct-binding annotation case (`declare const x: LocalArr`) - param resolution goes
// through a different binding-init branch but reaches the same namespace type lookup,
// so it must also benefit from the TSModuleBlock-body fallback walk.
namespace NS {
  type LocalArr = number[];
  function process(x: LocalArr) {
    x.at(0);
  }
}
