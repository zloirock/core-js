import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _sliceMaybeArray from "@core-js/pure/actual/array/instance/slice";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _at from "@core-js/pure/actual/instance/at";
import _Map from "@core-js/pure/actual/map/constructor";
var _ref2, _ref3, _ref4, _ref5, _ref11, _ref12;
// the composed two-step over an UNTYPED receiver: nothing says what the value is, so the outer hop
// dispatches GENERICALLY - the surface is what the hop reads, and the key names it whatever the
// receiver turns out to be. spelling the hop raw fired the source's default on the very path the
// ponyfill answers, which is the arm a foreign receiver actually takes
function viaParam(o) {
  var _ref;
  const viaHop = _nameMaybeFunction((_ref = _at(o)) === void 0 ? {} : _ref);
  return viaHop;
}
// ... and the receiver needs no re-readable token of its own: the hop step spells it ONCE, inside
// its own dispatch, so a CALL and a literal compose exactly like a binding - and the claim INSIDE
// such a receiver keeps its own step, because the spelling is read LIVE rather than copied at
// registration (a copy taken before that rewrite dropped the inner `slice`)
const viaCall = mk();
const fromCall = _nameMaybeFunction((_ref2 = _at(viaCall)) === void 0 ? {} : _ref2);
const fromLiteral = _nameMaybeFunction((_ref3 = _atMaybeArray([1, 2])) === void 0 ? {} : _ref3);
const fromInnerClaim = _nameMaybeFunction((_ref4 = _atMaybeArray(_sliceMaybeArray(_ref5 = [1, 2]).call(_ref5))) === void 0 ? {} : _ref4);
export { fromCall, fromLiteral, fromInnerClaim };
try {
  risky();
} catch (_ref6) {
  let _ref7;
  let viaCatch = _nameMaybeFunction((_ref7 = _at(_ref6)) === void 0 ? {} : _ref7);
  use(viaCatch);
}
// the CATCH host is the same question one relocation further: the caught value has no type either,
// and its flat twin already dispatches generically
try {
  risky();
} catch (_ref8) {
  let _ref9,
    caught = (_ref9 = _at(_ref8)) === void 0 ? 1 : _ref9;
  use(caught);
}
try {
  risky();
} catch (_ref10) {
  let flat = _at(_ref10);
  use(flat);
}
export { viaParam };
// ... and a receiver whose CONSTRUCTOR this pass already substituted needs no hop dispatch at all:
// the ponyfill carries the method on its own prototype, which is why the flat twin of the same read
// is native. an instance method pure adds to a NATIVE prototype is the other case, and it dispatches
const mapRecv = new _Map();
const fromReplacedCtor = _at((_ref11 = mapRecv.keys) === void 0 ? [] : _ref11);
const arrayRecv = new Array(3);
const fromNativeProto = _at((_ref12 = _flatMaybeArray(arrayRecv)) === void 0 ? [] : _ref12);
export { fromReplacedCtor, fromNativeProto };