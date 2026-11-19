import _Array$of from "@core-js/pure/actual/array/of";
import _JSON$parse from "@core-js/pure/actual/json/parse";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
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
export function outerArity(flag) {
  let gb, of, parse;
  ({
    self: {
      Map: {
        groupBy: gb
      },
      Array: {
        of
      }
    },
    JSON: {
      parse
    }
  } = flag ? userRoot : {
    self: {
      Map: {
        groupBy: _Map$groupBy
      },
      Array: {
        of: _Array$of
      }
    },
    JSON: {
      parse: _JSON$parse
    }
  });
  return [gb, of, parse];
}