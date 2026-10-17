import _Object$getPrototypeOf from "@core-js/pure/actual/object/get-prototype-of";
// marked NON-host SE operands in a for-init sink stay verbatim, each effect exactly once
let outNH;
for (const gpo = (eff(), other(), _Object$getPrototypeOf); !outNH;) outNH = gpo;
export const r = [outNH];