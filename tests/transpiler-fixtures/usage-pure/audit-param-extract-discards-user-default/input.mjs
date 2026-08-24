// the param routes drop the user-written default (polyfill always wins), so a polyfillable read
// inside it goes with it: body-extract removes the whole prop, the rest-sibling shape cuts
// it back to its key plus a fresh sentinel, and the inline default replaces the default alone.
// the last row keeps its default in the pattern, so the read there stays polyfilled in place
let e = 0;
export const bodyExtract = (function f({ from = [Promise], [Symbol.iterator]: it } = Array) {
  return [from([1]), it];
})();
export const restSibling = (({ from = [Promise], ...rest } = Array) => [from, rest])();
export const seKeyDefault = (({ [(e++, 'from')]: from = [Promise] } = Array) => from)();
export const keptDefault = (({ at = [Promise] } = []) => at)();
