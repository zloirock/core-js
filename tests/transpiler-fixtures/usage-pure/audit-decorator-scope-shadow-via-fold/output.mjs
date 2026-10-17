import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// The decorator sub-traversal's frame scope must stay position-aware and complete: a block `let` that does NOT cover the use
// resolves past it (the fold / alias substitution still fires); a switch's case-body `let` covers the cases but not the
// DISCRIMINANT; a named class expression binds its OWN name for the class extent (a self-reference resolves to the class, never to
// the polyfilled global of the same name).
const iterator = _Symbol$iterator;
@(function () {
  {
    let iterator = 1;
  }
  return _getIteratorMethod([]);
})
class ViaFold {}
export { ViaFold };