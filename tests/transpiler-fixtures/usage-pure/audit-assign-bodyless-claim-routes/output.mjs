import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _withMaybeArray from "@core-js/pure/actual/array/instance/with";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// an assignment host in a BODYLESS control slot claims what every other host claims: the slot has no
// statement list of its own, so its drain wraps the block - one statement stays bare, two take a
// block - and standing down there left this leg native where the other one polyfilled
const log = [];
let from, rest, keyed, other, nested, sibling, kw, prefixed;
// a REST sibling keeps the slot under a sentinel (rest must go on excluding the key), the sentinel
// `var` leads the block (it declares, it does not run) and the extraction follows: it owes the
// residual nothing
if (log.length >= 0) {
  var _unused;
  from = _Array$from;
  ({
    from: _unused,
    ...rest
  } = Array);
}
// ... while an SE KEY makes the residual lead: the key runs where the source wrote it, ahead of the
// lookup it feeds
if (log.length >= 0) {
  ({
    [(_pushMaybeArray(log).call(log, "k"), "at")]: keyed,
    other
  } = [3, [7]]);
  keyed = _atMaybeArray([3, [7]]);
}
// a SURVIVING sibling rides the same block, the extraction after it - it spells its own pure and
// reads nothing
if (log.length >= 0) {
  ({
    sibling
  } = _globalThis);
  nested = _Map$groupBy;
}
// the SE PREFIX of the init is re-derived from the CURRENT right: the walk rewrote the claims INSIDE
// it, and lifting the recorded nodes printed the source's own spelling beside the polyfilled one
if (log.length >= 0) {
  kw = (_pushMaybeArray(log).call(log, "e"), _globalThis);
  prefixed = _flatMaybeArray(_globalThis.Array.prototype);
}
// a receiver that OWES something keeps its lift INSIDE the slot: the dispatch may take the statement
// only when nothing is left to run ahead of it, since an effect lifted off a bodyless slot is queued
// against the list holding the CONTROL statement - it would run where the source runs nothing
let kwWrap, wrapped;
if (log.length < 0) {
  [kwWrap = _globalThis];
  wrapped = _withMaybeArray(_globalThis.Array.prototype);
}
export { from, rest, keyed, other, nested, sibling, kw, prefixed, kwWrap, wrapped, log };