import _Array$from from "@core-js/pure/actual/array/from";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// the decorator sub-traversal's frame scope must stay position-aware and complete: a block
// `let` that does NOT cover the use resolves past it (the fold / alias substitution still
// fires); a switch's case-body `let` covers the cases but not the DISCRIMINANT; a named
// class expression binds its OWN name for the class extent (a self-reference resolves to
// the class, never to the polyfilled global of the same name).
const iterator = _Symbol$iterator;
@(function () {
  {
    let iterator = 1;
  }
  return _getIteratorMethod([]);
})
class ViaFold {}
const G = _globalThis;
@(function () {
  {
    let G = 1;
  }
  return _Array$from([1]);
})
class ViaAlias {}
@(function () {
  switch (_globalThis.mode) {
    case 1:
      let globalThis = 1;
      return globalThis;
    default:
      return 0;
  }
})
class ViaSwitch {}
@(class Map {
  make() {
    return Map;
  }
})
class ViaClassName {}
export { ViaFold, ViaAlias, ViaSwitch, ViaClassName };