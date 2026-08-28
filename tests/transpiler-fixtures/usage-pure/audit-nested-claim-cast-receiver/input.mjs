// a CAST is what the source says the receiver IS, and the nested slot read honours it exactly as the
// member spelling does: through `as any` the slot answers nothing and the claim takes the generic
// dispatcher, through a declared shape it answers that shape. the spelled receiver keeps the cast,
// so the memo reads what the source reads
interface Box { y: number[] }
const box = { y: [1, 2] };
const widened = (function () {
  const { y: { at, other } } = box as any;
  return [at, other];
})();
const declared = (function () {
  const { y: { at } } = box as Box;
  return at;
})();
export { widened, declared };
