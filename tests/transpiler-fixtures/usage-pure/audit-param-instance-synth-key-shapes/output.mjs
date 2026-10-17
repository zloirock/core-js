import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findIndexMaybeArray from "@core-js/pure/actual/array/instance/find-index";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _globalThis from "@core-js/pure/actual/global-this";
// Parameter default mirrors replay resolved keys and keep instance reads at their original slot.
// The key's resolved name also selects the typed helper through the shared resolver.
const identifierKey = function (_ref = [1, 2]) {
  let at = _atMaybeArray(_ref);
  return at;
}();
const stringKey = function (_ref2 = [1, 2]) {
  let f = _flatMaybeArray(_ref2);
  return f;
}();
const foldedComputedKey = function ({
  ['flat' + 'Map']: fm
} = {
  flatMap: _flatMapMaybeArray([1, 2])
}) {
  return fm;
}();
const templateKey = function ({
  [`findLa${'st'}`]: fl
} = {
  findLast: _findLastMaybeArray([1, 2])
}) {
  return fl;
}();
// An effectful folded key runs once before the method lookup. This closed default caller
// admits an ordered body capture, while the literal carries the key's stable spelling.
let effects = 0;
const sideEffectingKey = function (_ref3 = void 0) {
  let _ref4 = false;
  let _ref5 = _ref3 === void 0 ? (_ref4 = true, [1, 2]) : _ref3,
    {} = _ref5,
    {
      ["findIndex"]: fi
    } = (effects++, _ref4 ? {
      "findIndex": _findIndexMaybeArray(_ref5)
    } : _ref5);
  return fi;
}();
// NEGATIVE: a key that folds to no name cannot be replayed without re-evaluating it, so the
// receiver stays native and the extraction is left alone
const dynamicKeyStaysNative = function ({
  [_globalThis.pick]: p
} = [1, 2]) {
  return p;
}();
export { identifierKey, stringKey, foldedComputedKey, templateKey, sideEffectingKey, dynamicKeyStaysNative, effects };