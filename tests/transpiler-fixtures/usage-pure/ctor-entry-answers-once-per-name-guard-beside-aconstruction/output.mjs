import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
export function guardBesideAConstruction(mk) {
  let W = _Map;
  switch (mk(() => {
    W = mk();
  })) {
    case 1:
      let W = 0;
      mk(W);
  }
  mk(W);
  return [(W === _Map ? _Map$groupBy : W.groupBy.bind(W))([1], x => x), new _Map()];
}