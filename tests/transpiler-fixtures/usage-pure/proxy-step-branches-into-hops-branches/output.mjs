import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _self from "@core-js/pure/actual/self";
// A pristine proxy step descends into EVERY hop under it, each hop carrying its own key path; the drain merges them back under the
// step they share - a repeated step key nests rather than repeating itself - and counts the branch's arity in OUTER props, one of
// which may cover several hops at once.
const userRoot = {
  self: {
    Map: {
      groupBy: () => 'U'
    },
    Array: {
      prototype: {
        at: () => 'U'
      }
    }
  }
};
export function branches(flag) {
  let gb, at;
  ({
    self: {
      Map: {
        groupBy: gb
      },
      Array: {
        prototype: {
          at
        }
      }
    }
  } = flag ? userRoot : {
    self: {
      Map: {
        groupBy: _Map$groupBy
      },
      Array: {
        prototype: {
          at: _atMaybeArray(_self.Array.prototype)
        }
      }
    }
  });
  return [gb, at];
}