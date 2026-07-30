import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findIndexMaybeArray from "@core-js/pure/actual/array/instance/find-index";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _globalThis from "@core-js/pure/actual/global-this";
// the INSTANCE param-default synth replaces the default with `{ key: helper(receiver) }`. it used to
// admit Identifier keys only, on the grounds that the literal would drop any other spelling - once
// the literal replays them, that restriction only cost the polyfill. the key's resolved name also
// picks the TYPED helper over the generic dispatcher, so it must come from the shared resolver
const identifierKey = function ({
  at
} = {
  at: _atMaybeArray([1, 2])
}) {
  return at;
}();
const stringKey = function ({
  'flat': f
} = {
  "flat": _flatMaybeArray([1, 2])
}) {
  return f;
}();
const foldedComputedKey = function ({
  ['flat' + 'Map']: fm
} = {
  ['flat' + 'Map']: _flatMapMaybeArray([1, 2])
}) {
  return fm;
}();
const templateKey = function ({
  [`findLa${'st'}`]: fl
} = {
  [`findLa${'st'}`]: _findLastMaybeArray([1, 2])
}) {
  return fl;
}();
// an effect-BEARING key folds to its name too: the effect stays on the pattern and runs once at
// destructure, while the literal spells the plain name. a param host has nowhere to put a separate
// binding, so this routes to the receiver synth like every other shape here
let effects = 0;
const sideEffectingKey = function ({
  [(effects++, 'findIndex')]: fi
} = {
  "findIndex": _findIndexMaybeArray([1, 2])
}) {
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