import _fillMaybeArray from "@core-js/pure/actual/array/instance/fill";
import _filterMaybeArray from "@core-js/pure/actual/array/instance/filter";
import _findMaybeArray from "@core-js/pure/actual/array/instance/find";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// A pattern whose init calls its own binding (`const { at } = at()`) invokes it before it holds
// anything. Proving that callee pairs the binding's slot from the very same call, so the proof stops
// at the binding with no callee: the call stays as written and the extraction reads its result.
// Plain, optional, constructed, invoker, tagged, mutual and awaited spellings, plus a factory
// returning the call, plain and awaited.
const at = _at(at());
var includes = _includes(includes?.());
const flat = _flatMaybeArray(new flat());
const fill = _fillMaybeArray(fill.call(null));
const find = _findMaybeArray(find``);
const first = _mapMaybeArray(second());
const second = _filterMaybeArray(first());
function make() {
  return flatMap();
}
const flatMap = _flatMapMaybeArray(make());
export async function read() {
  const findLast = _findLastMaybeArray(await findLast());
  return findLast;
}
export async function load() {
  async function fetchIndex() {
    return findLastIndex();
  }
  const findLastIndex = _findLastIndexMaybeArray(await fetchIndex());
  return findLastIndex;
}