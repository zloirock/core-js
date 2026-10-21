import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// Effectful realm keys stay in their source reads; quiet constant keys still collapse.
let log = [];
function eff(tag) {
  _pushMaybeArray(log).call(log, tag);
  return 'se';
}
const g = _globalThis;
const bareConcat = _globalThis[(eff('a'), 'se') + 'lf'].Array.isArray([1]);
const aliasTemplate = g[`s${eff('b'), 'e'}lf`].Math.max(1, 2);
const directSe = _globalThis[eff('c'), 'self'].Array.from([3]);
const noSe = _Array$of(4);
export { bareConcat, aliasTemplate, directSe, noSe, log };