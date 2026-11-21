// A plain write does not read the previous method.
const xs = [1];
xs.at = 1;
export const a = xs;
