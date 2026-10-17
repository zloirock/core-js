import _Promise from "@core-js/pure/actual/promise";
const registry = {
  Promise: _Promise
};
const k = "Promise";
registry[k].allSettled = patchD;
const r4 = _Promise.allSettled(list);
export { r4 };