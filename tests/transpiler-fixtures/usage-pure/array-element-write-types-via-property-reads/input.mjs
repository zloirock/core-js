// non-method member reads stay plain reads - element precision survives
const measured = [[1], [2]];
export const viaPropertyReads = measured[0].includes(7);
