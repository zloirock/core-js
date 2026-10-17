import _Iterator from "@core-js/pure/actual/iterator";
let env;
(env || _Iterator).from = patchB;
const r2 = _Iterator.from(src);
export { r2 };