import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator$concat from "@core-js/pure/actual/iterator/concat";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise$any from "@core-js/pure/actual/promise/any";
import _Reflect$apply from "@core-js/pure/actual/reflect/apply";
import _Reflect from "@core-js/pure/actual/reflect/namespace";
import _Reflect$ownKeys from "@core-js/pure/actual/reflect/own-keys";
// A bound array literal hands its element to a destructure whose constructor hop is anchored on that
// constructor's ponyfill: a static claimed there leaves no read of itself behind, in any host - an export,
// a loop head, an unbraced `var`, a held hole, two claims - and the constructor's own import stays only
// for a key it serves no static for, which reads it off the ponyfill.
const wrap = [_globalThis];
const holed = [0, _globalThis];
const [_ref] = wrap;
export const allSettled = _Promise$allSettled;
for (const [_ref2] = wrap, any = _Promise$any;;) {
  use(any);
  break;
}
if (flag) var [_ref3] = wrap,
  ownKeys = _Reflect$ownKeys;
const [, _ref4] = holed;
const groupBy = _Map$groupBy;
const [_ref5] = wrap;
const from = _Iterator$from;
const concat = _Iterator$concat;
const [_ref6] = wrap;
const apply = _Reflect$apply;
const {
  extra
} = _Reflect;
use(ownKeys, groupBy, from, concat, apply, extra);