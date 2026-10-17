// marked NON-host SE operands in a for-init sink stay verbatim, each effect exactly once
let outNH;
for (const { getPrototypeOf: gpo } = ((eff(), other()), Object); !outNH;) outNH = gpo;
export const r = [outNH];
