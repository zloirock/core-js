// a rest sibling under the buried hop bails the fold (rest excludes the peel) - verbatim
let onc, rst, outRS;
for (const { getOwnPropertySymbols: gops } = (({ self: { onclick: onc, ...rst } } = globalThis), Object); !outRS;) outRS = gops;

export const r = [onc, rst, outRS];
