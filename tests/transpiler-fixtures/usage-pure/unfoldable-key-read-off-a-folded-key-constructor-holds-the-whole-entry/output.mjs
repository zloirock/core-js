import _joinMaybeArray from "@core-js/pure/actual/array/instance/join";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator from "@core-js/pure/actual/iterator";
import _Map from "@core-js/pure/actual/map";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _URL from "@core-js/pure/actual/url";
var _ref, _ref2, _ref3, _ref4;
// a read by a key no fold names, off a constructor taken through a computed key the claim folds - an effect ahead
// of the name, a const binding, a concat - may read any of its statics and holds the whole entry, as off the
// plainly keyed constructor. a named static read off such a constructor keeps the narrow entry beside its own
let k = 0;
const K = 'Map';
const ViaEffect = _Iterator;
const {
  [(k++, 'Iterator')]: _unused
} = _globalThis;
export const fromEffect = ViaEffect[_joinMaybeArray(_ref = ['fr', 'om']).call(_ref, '')](_valuesMaybeArray(_ref2 = [1]).call(_ref2)).toArray();
const ViaBound = _Map;
export const fromBound = ViaBound[_joinMaybeArray(_ref3 = ['group', 'By']).call(_ref3, '')]([1], x => x).get(1);
const ViaConcat = _URL;
export const fromConcat = ViaConcat[_joinMaybeArray(_ref4 = ['can', 'Parse']).call(_ref4, '')]('a:b');
const Named = _Promise;
const {
  [(k++, 'Promise')]: _unused2
} = _globalThis;
export const settled = _Promise$allSettled([]);