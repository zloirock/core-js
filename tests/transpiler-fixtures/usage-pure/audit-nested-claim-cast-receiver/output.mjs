import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _at from "@core-js/pure/actual/instance/at";
// a CAST is what the source says the receiver IS, and the nested slot read honours it exactly as the
// member spelling does: through `as any` the slot answers nothing and the claim takes the generic
// dispatcher, through a declared shape it answers that shape. the spelled receiver keeps the cast,
// so the memo reads what the source reads
interface Box {
  y: number[];
}
const box = {
  y: [1, 2]
};
const widened = function () {
  const _ref = (box as any).y;
  const at = _at(_ref);
  const {
    other
  } = _ref;
  return [at, other];
}();
const declared = function () {
  const at = _atMaybeArray(box.y);
  return at;
}();
export { widened, declared };