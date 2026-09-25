import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _Set from "@core-js/pure/actual/set/constructor";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// A symbol-iterator value keeps the claims nested beneath its pattern.
// Sibling statics must not hide instance properties read from that value.
const name = _nameMaybeFunction(_getIteratorMethod(_globalThis));
const viaAlias = _nameMaybeFunction(_getIteratorMethod(_globalThis));
const _ref = _globalThis;
const {
  customQ
} = _Set;
const viaSibling = _nameMaybeFunction(_getIteratorMethod(_ref)); // NEGATIVES. two leaves keep the destructure: each polyfilled leaf would need the receiver again,
// and the receiver is the synth CALL - re-running it re-reads the source's `Symbol.iterator`
const {
  name: twoA,
  bind: twoB
} = _getIteratorMethod(_globalThis); // a leaf needing no polyfill stays a plain read, and a non-pattern value keeps the plain synth
const {
  bind
} = _getIteratorMethod(_globalThis);
const plain = _getIteratorMethod(_globalThis); // a non-proxy receiver reaches the synth through the emitters' own symbol route rather than the
// plan - it asks the SAME shared helper, so the leaf resolves there too, with or without a sibling
const viaCtor = _nameMaybeFunction(_getIteratorMethod(Array));
const _ref2 = {
    of: _Array$of,
    [_Symbol$iterator]: _getIteratorMethod(Array)
  },
  {
    of
  } = _ref2,
  {
    [_Symbol$iterator]: {
      name: viaSiblingCtor
    }
  } = _ref2;
// NEGATIVE: a DEFAULTED leaf keeps the destructure - binding the dispatcher result directly would
// drop the user's default, and guarding it is the instance-default channel's own shape
const {
  name: viaDefault = fallback()
} = _getIteratorMethod(Array);
console.log(name, viaAlias, viaSibling, customQ, twoA, twoB, bind, plain, viaCtor, of, viaSiblingCtor, viaDefault);