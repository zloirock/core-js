// a CAST narrows where it resolves and never blocks: what a leaf reads is the runtime VALUE, and an
// annotation is one more way to learn its type. a declared shape answers from the shape; `as any`
// names nothing, so the read answers from the value exactly as an uncast receiver does - a built-in
// surface narrows whichever spelling the hop key wears, and the spelled receiver keeps the cast
interface Box { y: number[] }
const box = { y: [1, 2] };
const widened = (function () {
  const { y: { at, other } } = box as any;
  return [at, other];
})();
const declared = (function () {
  const { y: { find } } = box as Box;
  return find;
})();
const surface = (function () {
  const { Array: { prototype: { includes } } } = globalThis as any;
  const { ['Array']: { prototype: { map } } } = globalThis as any;
  return [includes, map];
})();
export { widened, declared, surface };
