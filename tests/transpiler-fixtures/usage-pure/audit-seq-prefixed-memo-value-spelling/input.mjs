// an effect-bearing SEQUENCE around the value a dispatch memoizes: the effect runs where the source
// wrote it and the navigation collapses beside it, inside the same sequence. the render lands in
// the sequence TAIL for exactly that reason - replacing the whole stored value swallowed the prefix,
// and reading the value without descending it left the source read raw in one consumer and
// collapsed in the other
let out;
function eff() {}
const { trunc } = (eff(), globalThis.window?.self)?.Array.prototype.at.Math;
out = (eff(), globalThis.window?.self)?.Array.prototype.at;
export { trunc, out };
