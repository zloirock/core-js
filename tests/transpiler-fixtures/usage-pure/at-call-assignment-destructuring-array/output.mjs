import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
var _ref2;
// Object-rest keeps the affected assignment pattern native and preserves its RHS value.
// Independent reads and key/default expressions still receive their own polyfills.
const src2 = [1, [2]];
let at, includes;
const _ref = [1, 2, 3];
at = _atMaybeArray(_ref);
includes = _includesMaybeArray(_ref);
let at2, rest2;
({
  at: at2,
  ...rest2
} = [1, 2]);
// An effectful receiver still runs once.
let at3, rest3;
({
  at: at3,
  ...rest3
} = mk());
// A binding receiver follows the same native-rest boundary.
let at4, rest4;
const src = [1, 2];
({
  at: at4,
  ...rest4
} = src);
export { at, includes, at2, rest2, at3, rest3, at4, rest4 };
// a claim INSIDE the receiver keeps its own step: the consume spells that receiver, and a copy
// taken when the job registered carries the source read with its polyfill lost - the spelling is
// read LIVE instead. the memo route already did, its `_ref` being built from the rewritten init
const other = [3, [4]];
let inner;
inner = _atMaybeArray(_flatMaybeArray(other).call(other));
// ... and so does a claim inside the slot DEFAULT, read through the slot at render time
let viaDefault;
viaDefault = _nameMaybeFunction((_ref2 = _atMaybeArray(src2)) === void 0 ? _flatMaybeArray(other).call(other) : _ref2);
export { inner, viaDefault };