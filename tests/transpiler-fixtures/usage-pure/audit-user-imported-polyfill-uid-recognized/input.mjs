// user-imported polyfill UID for Promise constructor: static methods (resolve / reject /
// all) live in separate modules, so direct member access would crash at runtime. the
// plugin must recognize `_Promise` as the polyfill alias and rewrite to dedicated UIDs
import _Promise from '@core-js/pure/actual/promise/constructor';
const r = _Promise.resolve(1);
const j = _Promise.reject(2);
const a = _Promise.all([r]);
export { r, j, a };
