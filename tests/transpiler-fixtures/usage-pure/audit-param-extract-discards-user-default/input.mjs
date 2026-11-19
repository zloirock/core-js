// A mirrored receiver supplies claimed statics; a rest-bearing parameter retains its native read.
// Declined rewrites preserve author defaults and their independent polyfill claims.
let e = 0;
export const bodyExtract = (function f({ from = [Promise], [Symbol.iterator]: it } = Array) {
  return [from([1]), it];
})();
export const restSibling = (({ from = [Promise], ...rest } = Array) => [from, rest])();
export const seKeyDefault = (({ [(e++, 'from')]: from = [Promise] } = Array) => from)();
export const keptDefault = (({ at = [Promise] } = []) => at)();
