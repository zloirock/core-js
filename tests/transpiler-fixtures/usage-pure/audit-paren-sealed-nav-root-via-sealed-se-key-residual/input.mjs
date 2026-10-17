// ARRAY-pattern and const-alias computed-key destructures ride the probe like the named
// forms; an SE-key residual re-reads the source itself (throw + key SE both live there)
let c8 = 0;
export const { [(c8++, 'defineProperty')]: viaSealedSeKeyResidual } = (globalThis.window?.self.window).Object;
export { c8 };
