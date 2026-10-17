import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
var _ref;
// an SE-carrying inline BODY of the call root replays as a sequence prefix on the collapsed
// guard test (`(db(), _self).window`) - the effect runs exactly once, the branch reads the
// ponyfill leaf
let bodyCount = 0;
const db = () => {
  bodyCount++;
  return _globalThis;
};
export const viaSeBodyRoot = null == (db(), _self).window ? void 0 : _atMaybeArray(_ref = _Array$of(11)).call(_ref, 0);