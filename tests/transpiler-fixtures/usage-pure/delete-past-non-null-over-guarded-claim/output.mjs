import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _toReversedMaybeArray from "@core-js/pure/actual/array/instance/to-reversed";
// A deleted member standing past a `!` over a guarded claim takes the claim's short-circuit: the
// assertion continues the chain, so the whole operator rides the guard, and a claim yielding
// `undefined` on a present receiver is read plainly, throwing as the source does. A paren between
// them seals instead, and the delete reads the guard's value plainly.
declare const boxes: {
  k?: number;
  j?: {
    k?: number;
  };
}[] | null;
boxes == null ? true : delete _atMaybeArray(boxes).call(boxes, -1)!.k;
boxes == null ? true : delete _findLastMaybeArray(boxes).call(boxes, Boolean)!!.j!.k;
delete (boxes == null ? void 0 : _toReversedMaybeArray(boxes).call(boxes))!.k;