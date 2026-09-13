// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
let e = 0;
export const bodyExtract = (function f({ from = [Promise], [Symbol.iterator]: it } = Array) {
  return [from([1]), it];
})();
export const restSibling = (({ from = [Promise], ...rest } = Array) => [from, rest])();
export const seKeyDefault = (({ [(e++, 'from')]: from = [Promise] } = Array) => from)();
export const keptDefault = (({ at = [Promise] } = []) => at)();
