import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$values from "@core-js/pure/actual/object/values";
import _Promise$any from "@core-js/pure/actual/promise/any";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Reflect from "@core-js/pure/actual/reflect/namespace";
import _Reflect$ownKeys from "@core-js/pure/actual/reflect/own-keys";
import _padStartMaybeString from "@core-js/pure/actual/string/instance/pad-start";
import _Symbol$asyncIterator from "@core-js/pure/actual/symbol/async-iterator";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _Symbol$for from "@core-js/pure/actual/symbol/for";
var _ref;
// a `for` header is the only destructure host with no statement slot: its init stays IN the
// header instead of being lifted, so the pass that re-walks a lifted init never sees it. the
// receiver collapse re-emits its harvested effects as raw copies taken before those effects
// were themselves rewritten, so the header shipped them unpolyfilled - and the collapse itself
// stopped short, leaving the proxy root where every other position reads the constructor. a
// re-emitted effect that needs a memo carries no source range either, so the ref placement could
// not confirm itself against the loop body and landed the declaration inside it
const log = [];
const obj = { text: 'ab' };
const arr = [3, 1, 2];
let k;
function gf() { return _globalThis; }
for (const _ref2 = (_pushMaybeArray(log).call(log, 'k'), _Map), g = _Map$groupBy; false; ) break;
for (const _ref3 = (_atMaybeArray(arr).call(arr, 0), _Promise), a = _Promise$any; false; ) break;
for (const _ref4 = (_flatMaybeArray(arr).call(arr), _Reflect), o = _Reflect$ownKeys; false; ) break;
for (const _ref5 = (k = _globalThis, _includesMaybeArray(arr).call(arr, 1), _Symbol), s = _Symbol$for; false; ) break;
for (const _ref6 = _globalThis[(_findLastMaybeArray(arr).call(arr, Boolean), 'Object')], v = _Object$values; false; ) break;
for (const _ref7 = (_padStartMaybeString(_ref = obj.text).call(_ref, 4, '.'), _Symbol), i = _Symbol$asyncIterator; false; ) break;
export { log, k };