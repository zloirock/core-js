// The parameter reads a static from the constructor stored by a conditional pattern.
let P;
if (true) ({ Promise: P } = globalThis);
function f({ try: t } = P) { return typeof t; }
export const result = f();
