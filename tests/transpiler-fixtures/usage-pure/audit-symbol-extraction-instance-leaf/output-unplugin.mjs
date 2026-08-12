import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _Set from "@core-js/pure/actual/set/constructor";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// the value a `[Symbol.iterator]` extraction pulls out IS the iterator method - a function - so a
// leaf destructured from it is an INSTANCE member of that function and keeps its polyfill. only the
// plan can decide this: the extracted pattern's properties are claimed against a re-visit, and a
// shorthand leaf is no member read, so nothing downstream would ask
const name = _nameMaybeFunction(_getIteratorMethod(_globalThis));
const viaAlias = _nameMaybeFunction(_getIteratorMethod(_globalThis));
const { union } = _Set;
const viaSibling = _nameMaybeFunction(_getIteratorMethod(_globalThis));
// NEGATIVES. two leaves keep the destructure: each polyfilled leaf would need the receiver again,
// and the receiver is the synth CALL - re-running it re-reads the source's `Symbol.iterator`
const { name: twoA, bind: twoB } = _getIteratorMethod(_globalThis);
// a leaf needing no polyfill stays a plain read, and a non-pattern value keeps the plain synth
const { bind } = _getIteratorMethod(_globalThis);
const plain = _getIteratorMethod(_globalThis);
// a non-proxy receiver reaches the synth through the emitters' own symbol route rather than the
// plan - it asks the SAME shared helper, so the leaf resolves there too, with or without a sibling
const viaCtor = _nameMaybeFunction(_getIteratorMethod(Array));
const viaSiblingCtor = _nameMaybeFunction(_getIteratorMethod(Array));
const of = _Array$of;
const { [_Symbol$iterator]: _unused } = Array;
// NEGATIVE: a DEFAULTED leaf keeps the destructure - binding the dispatcher result directly would
// drop the user's default, and guarding it is the instance-default channel's own shape
const { name: viaDefault = fallback() } = _getIteratorMethod(Array);
console.log(name, viaAlias, viaSibling, union, twoA, twoB, bind, plain, viaCtor, of, viaSiblingCtor, viaDefault);