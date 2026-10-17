// control: the flat extraction channel serves the static outright - its pure import is never
// undefined, so the default is dead
let shim = () => [];
const { of = shim } = Array;
export const viaGuardedExtraction = of(1, 2);
