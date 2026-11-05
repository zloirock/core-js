import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
// A literal owns its native slot. The realm and each live default can be served independently.
export function run(user) {
  const seen = [];
  for (const {
    Array: {
      of
    }
  } of [{
    Array: {
      of: _Array$of
    }
  }, {
    Array: user
  }]) _pushMaybeArray(seen).call(seen, typeof of);
  const [{
    MissingObject: {
      fromEntries
    } = {
      fromEntries: _Object$fromEntries
    }
  }] = [_globalThis];
  return [seen, fromEntries([['value', 7]])];
}
export function select(flag) {
  const {
      C: _ref
    } = flag ? {
      C: _Map
    } : {
      C: Object
    },
    groupBy = _ref === Object ? _Object$groupBy : _ref.groupBy;
  return groupBy;
}