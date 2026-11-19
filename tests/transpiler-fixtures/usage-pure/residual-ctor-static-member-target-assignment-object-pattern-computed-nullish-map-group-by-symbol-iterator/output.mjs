import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// ... and a MULTI-hop pattern splits the same way, each hop answering on its own (a well-known-symbol
// leaf reads as the hop's own value)
let gb, it;
({
  Map: {
    groupBy: gb
  },
  Symbol: {
    [_Symbol$iterator]: it
  }
} = {
  Map: {
    groupBy: _Map$groupBy
  },
  Symbol: _Symbol
});
export const r = [gb, it];