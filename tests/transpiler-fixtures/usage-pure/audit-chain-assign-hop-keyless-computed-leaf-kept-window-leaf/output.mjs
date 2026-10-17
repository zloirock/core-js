import _globalThis from "@core-js/pure/actual/global-this";
// a kept-window value drops the redundant hop and keeps the raw read (native throws in the
// same place where the value is absent)
let od;
export const keptWindowLeaf = (od = _globalThis.window)[0];