import _Array$of from "@core-js/pure/actual/array/of";
// control: the flat extraction channel serves the static outright - its pure import is never
// undefined, so the default is dead
let shim = () => [];
const of = _Array$of;
export const viaGuardedExtraction = of(1, 2);