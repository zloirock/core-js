// a replaced global returns whatever the patch returns, so the known narrow drops to the
// generic dispatch - the same trust gate the static-registry arms already apply
globalThis.atob = (() => [1, 2]) as any;
atob('x').at(0);
parseFloat('1.5').toFixed(1);
