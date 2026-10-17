import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _toReversedMaybeArray from "@core-js/pure/actual/array/instance/to-reversed";
import _at from "@core-js/pure/actual/instance/at";
// A deleted member over a claim behind the receiver's `?.` belongs to the chain that `?.` ends: a
// nullish receiver deletes nothing and answers `true`, so the whole operator rides the guard. A
// claim yielding `undefined` on a present receiver is then read plainly past it and throws, as the
// source does - unless a `?.` of the source's own, or of the claim's own call, stands in between.
let boxes;
boxes == null ? true : delete _at(boxes).call(boxes, -1).j.k;
boxes == null ? true : delete _findLastMaybeArray(boxes).call(boxes, Boolean).j?.k;
boxes == null ? true : delete _toReversedMaybeArray(boxes)?.call(boxes)[0].k;