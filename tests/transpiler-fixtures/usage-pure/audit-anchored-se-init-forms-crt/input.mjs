// duplicate symbol leaves consume into TWO synth assigns in source order
let dupA, dupB;
export const { create: crt } = (({ Set: { [Symbol.iterator]: dupA, [Symbol.iterator]: dupB } } = globalThis), Object);

export const r = [dupA, dupB, crt];
