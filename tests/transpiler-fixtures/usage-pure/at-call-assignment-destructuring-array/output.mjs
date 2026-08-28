import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _at from "@core-js/pure/actual/instance/at";
var _ref4;
const src2 = [1, [2]];
let at, includes;
const _ref = [1, 2, 3];
at = _atMaybeArray(_ref);
includes = _includesMaybeArray(_ref);
// a REST sibling is a residual like any other: it re-reads the receiver past the renamed key, so
// the memo is what gives both readers one identity - the arrangement the DECLARATION host emits for
// the same pattern, and the one a receiver nothing can re-read has no other way to get
let at2, rest2;
const _ref2 = [1, 2];
var _unused;
at2 = _atMaybeArray(_ref2);
({
  at: _unused,
  ...rest2
} = _ref2);
// ... and a receiver whose evaluation is OBSERVABLE takes it for the same reason, once
let at3, rest3;
const _ref3 = mk();
var _unused2;
at3 = _at(_ref3);
({
  at: _unused2,
  ...rest3
} = _ref3);
// a re-readable receiver needs none of it: both readers spell the binding
let at4, rest4;
const src = [1, 2];
var _unused3;
at4 = _atMaybeArray(src);
({
  at: _unused3,
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
viaDefault = _nameMaybeFunction((_ref4 = _atMaybeArray(src2)) === void 0 ? _flatMaybeArray(other).call(other) : _ref4);
export { inner, viaDefault };