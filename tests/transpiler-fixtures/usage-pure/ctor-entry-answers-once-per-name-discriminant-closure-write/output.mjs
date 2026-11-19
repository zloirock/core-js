import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// All references to one constructor share one ponyfill binding. A constructor identity guard compares against the same entry that
// escaping references and writes use.
export function discriminantClosureWrite(mk) {
  let W = _Map;
  switch (mk(() => {
    W = mk();
  })) {
    case 1:
      let W = 0;
      mk(W);
  }
  mk(W);
  return (W === _Map ? _Map$groupBy : W.groupBy.bind(W))([1, 2], x => x % 2);
}