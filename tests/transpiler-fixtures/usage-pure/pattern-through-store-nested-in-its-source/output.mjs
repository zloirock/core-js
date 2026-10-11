import _Map from "@core-js/pure/actual/map";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise from "@core-js/pure/actual/promise/constructor";
// a pattern level reached through a STORE nested in the destructure source stays as written - pure
// would otherwise rewrite the container the store hands to `cache` - so the constructor the read
// lands on takes its whole entry. a store that is the source itself keeps the static named
let cache;
export const [[{
  groupBy
}]] = [cache = [_Map]];
let kept;
const [_ref] = kept = [_Promise];
const {
  allSettled: _unused
} = _ref;
export const allSettled = _Promise$allSettled;